import { Price } from "@/models/price";
import { PROGRAM_ID } from "@/utils/common";
import * as borsh from "@project-serum/borsh";
import * as web3 from "@solana/web3.js";
import BN from "bn.js";
import { PHASE_PRODUCTION_BUILD } from "next/dist/shared/lib/constants";

export class PriceCoordinator {
  static priceCount: number = 0;

  private static counterLayout = borsh.struct([
    borsh.str("discriminator"),
    borsh.u8("isInitialized"),
    borsh.u8("count"),
  ]);

  static async priceCounterPubkey(
    product: web3.PublicKey,
  ): Promise<web3.PublicKey> {
    return (
      await web3.PublicKey.findProgramAddress(
        [product.toBuffer(), Buffer.from("price")],
        new web3.PublicKey(PROGRAM_ID),
      )
    )[0];
  }

  static async syncPriceCount(
    connection: web3.Connection,
    product: web3.PublicKey,
  ) {
    const counterPda = await this.priceCounterPubkey(product);

    try {
      const account = await connection.getAccountInfo(counterPda);
      this.priceCount = this.counterLayout.decode(account?.data).count;
    } catch (e) {
      console.log(e);
    }
  }

  static async fetchPage(
    connection: web3.Connection,
    product: web3.PublicKey,
    page: number,
    perPage: number,
  ): Promise<Price[]> {
    await this.syncPriceCount(connection, product);

    console.log("Price count: ", this.priceCount);

    const start = this.priceCount - perPage * (page - 1);
    const end = Math.max(start - perPage, 0);

    let paginatedPublicKeys: web3.PublicKey[] = [];

    for (let i = start; i > end; i--) {
      const [pda] = await web3.PublicKey.findProgramAddress(
        [product.toBuffer(), new BN([i - 1]).toArrayLike(Buffer, "be", 8)],
        new web3.PublicKey(PROGRAM_ID),
      );
      paginatedPublicKeys.push(pda);
    }

    const accounts =
      await connection.getMultipleAccountsInfo(paginatedPublicKeys);

    const prices = accounts.reduce((accum: Price[], account) => {
      const price = Price.deserialize(account?.data);
      if (!price) {
        return accum;
      }

      return [...accum, price];
    }, []);

    return prices;
  }
}
