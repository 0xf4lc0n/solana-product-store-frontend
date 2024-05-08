import { Product } from "@/models/product";
import { PROGRAM_ID } from "@/utils/common";
import * as web3 from "@solana/web3.js";
import bs58 from "bs58";

export class ProductCoordinator {
  static accounts: web3.PublicKey[] = [];

  static async prefetchAccounts(connection: web3.Connection, search: string) {
    const offset = 4 + 7 + 1 + 32 + 8 + 4;
    const accounts = await connection.getProgramAccounts(
      new web3.PublicKey(PROGRAM_ID),
      {
        dataSlice: { offset: 0, length: offset + 20 },
        filters: [
          {
            memcmp: {
              offset: 4,
              bytes: bs58.encode(Buffer.from("product")),
            },
          },
        ],
      },
    );

    this.accounts = accounts.map((acc) => acc.pubkey);
  }

  static async fetchPage(
    connection: web3.Connection,
    page: number,
    perPage: number,
  ): Promise<Product[]> {
    if (this.accounts.length === 0) {
      await this.prefetchAccounts(connection, "");
    }

    const paginatedPublicKeys = this.accounts.slice(
      (page - 1) * perPage,
      page * perPage,
    );

    if (paginatedPublicKeys.length === 0) {
      return [];
    }

    const accounts =
      await connection.getMultipleAccountsInfo(paginatedPublicKeys);

    const products = accounts.reduce((accum: Product[], account) => {
      const product = Product.deserialize(account?.data);
      if (!product) {
        return accum;
      }

      return [...accum, product];
    }, []);

    return products;
  }
}
