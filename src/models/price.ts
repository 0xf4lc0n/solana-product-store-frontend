import { PublicKey } from "@solana/web3.js";
import * as borsh from "@project-serum/borsh";
import BN from "bn.js";

export class Price {
  product: PublicKey;
  price: number;
  timestamp: number;

  constructor(product: PublicKey, price: number, timestamp: number) {
    this.product = product;
    this.price = price;
    this.timestamp = new BN(timestamp);
  }

  borshChangePriceInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.f64("price"),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.str("discriminator"),
    borsh.bool("initialized"),
    borsh.publicKey("product"),
    borsh.f64("price"),
    borsh.i64("timestamp"),
  ]);

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);

    this.borshChangePriceInstructionSchema.encode(
      { ...this, variant: 2 },
      buffer,
    );

    return buffer.slice(
      0,
      this.borshChangePriceInstructionSchema.getSpan(buffer),
    );
  }

  static deserialize(buffer?: Buffer): Price | null {
    if (!buffer) {
      return null;
    }

    try {
      const { product, price, timestamp } =
        this.borshAccountSchema.decode(buffer);
      return new Price(product, price, timestamp);
    } catch (e) {
      console.log("Deserialize error: ", e);
      console.log(buffer);
      return null;
    }
  }
}
