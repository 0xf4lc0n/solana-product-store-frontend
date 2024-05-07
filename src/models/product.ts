import { PublicKey } from "@solana/web3.js";
import * as borsh from "@project-serum/borsh";

export class Product {
  seller: PublicKey;
  name: string;
  price: number;

  constructor(seller: PublicKey, name: string, price: number) {
    this.seller = seller;
    this.name = name;
    this.price = price;
  }

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("name"),
    borsh.f64("price"),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.str("discriminator"),
    borsh.bool("initialized"),
    borsh.publicKey("seller"),
    borsh.str("name"),
    borsh.f64("price"),
  ]);

  serialize(instruction: number): Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode(
      { ...this, variant: instruction },
      buffer,
    );
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer?: Buffer): Product | null {
    if (!buffer) {
      return null;
    }

    try {
      const { seller, name, price } = this.borshAccountSchema.decode(buffer);
      return new Product(seller, name, price);
    } catch (e) {
      console.log("Deserialize error: ", e);
      console.log(buffer);
      return null;
    }
  }
}
