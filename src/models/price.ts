import { PublicKey } from "@solana/web3.js";
import * as borsh from "@project-serum/borsh";
import BN from "bn.js";

export class Price {
  product: PublicKey;
  price: number;
  timestamp: Date;

  constructor(product: PublicKey, price: number, timestamp: Date) {
    this.product = product;
    this.price = price;
    this.timestamp = timestamp;
  }

  borshChangePriceInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.f64("price"),
    borsh.str("timestamp"),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.str("discriminator"),
    borsh.bool("initialized"),
    borsh.publicKey("product"),
    borsh.f64("price"),
    borsh.str("timestamp"),
  ]);

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);

    this.borshChangePriceInstructionSchema.encode(
      { ...this, variant: 2, timestamp: this.timestamp.getTime().toString() },
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

      return new Price(product, price, new Date(Number(timestamp)));
    } catch (e) {
      console.log("Deserialize error: ", e);
      console.log(buffer);
      return null;
    }
  }
}
