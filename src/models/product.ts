import { PublicKey } from "@solana/web3.js";
import * as borsh from "@project-serum/borsh";
import BN from "bn.js";
import { PROGRAM_ID } from "@/utils/common";

export class Product {
  seller: PublicKey;
  id: number;
  name: string;
  price: number;
  timestamp: string;

  constructor(seller: PublicKey, id: number, name: string, price: number) {
    this.seller = seller;
    this.id = new BN(id);
    this.name = name;
    this.price = price;
    this.timestamp = new Date().getTime().toString();
  }

  async publicKey(): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [this.seller.toBuffer(), new BN(this.id).toArrayLike(Buffer, "be", 8)],
        new PublicKey(PROGRAM_ID),
      )
    )[0];
  }

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.u64("id"),
    borsh.str("name"),
    borsh.f64("price"),
    borsh.str("timestamp"),
  ]);

  borshUpdateInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("name"),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.str("discriminator"),
    borsh.bool("initialized"),
    borsh.publicKey("seller"),
    borsh.u64("id"),
    borsh.str("name"),
    borsh.f64("price"),
  ]);

  serialize(instruction: number): Buffer {
    const buffer = Buffer.alloc(1000);

    switch (instruction) {
      case 0:
        this.borshInstructionSchema.encode(
          { ...this, variant: instruction },
          buffer,
        );
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
      case 1:
        this.borshUpdateInstructionSchema.encode(
          { name: this.name, variant: instruction },
          buffer,
        );
        return buffer.slice(
          0,
          this.borshUpdateInstructionSchema.getSpan(buffer),
        );
    }
  }

  static deserialize(buffer?: Buffer): Product | null {
    if (!buffer) {
      return null;
    }

    try {
      const { seller, id, name, price } =
        this.borshAccountSchema.decode(buffer);
      return new Product(seller, id, name, price);
    } catch (e) {
      console.log("Deserialize error: ", e);
      console.log(buffer);
      return null;
    }
  }
}
