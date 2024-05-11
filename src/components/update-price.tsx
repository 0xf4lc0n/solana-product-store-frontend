import { Product } from "@/models/product";
import { PROGRAM_ID, getConnection, getSigner } from "@/utils/common";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import BN from "bn.js";
import { Price } from "@/models/price";
import { PriceList } from "./price-list";
import { PriceCoordinator } from "@/coordinators/price-coordinator";

export function UpdatePrice(props: { product: Product }) {
  const [price, setPrice] = useState(props.product.price);
  const seller = getSigner();

  async function handleSubmit(event: any) {
    event.preventDefault();
    const productKey = await props.product.publicKey();
    handleTransactionSubmit(new Price(productKey, price, new Date()));
  }

  async function handleTransactionSubmit(newPrice: Price) {
    const buffer = newPrice.serialize();
    const transaction = new web3.Transaction();

    const productPda = newPrice.product;

    const [pdaProductCounter] = await web3.PublicKey.findProgramAddress(
      [seller.publicKey.toBuffer(), Buffer.from("product_counter")],
      new web3.PublicKey(PROGRAM_ID),
    );

    const [pdaCounter] = await web3.PublicKey.findProgramAddress(
      [productPda.toBuffer(), Buffer.from("price")],
      new web3.PublicKey(PROGRAM_ID),
    );

    await PriceCoordinator.syncPriceCount(getConnection(), productPda);

    const [pdaPrice] = await web3.PublicKey.findProgramAddress(
      [
        productPda.toBuffer(),
        new BN(PriceCoordinator.priceCount).toArrayLike(Buffer, "be", 8),
      ],
      new web3.PublicKey(PROGRAM_ID),
    );

    const instruction = new web3.TransactionInstruction({
      keys: [
        {
          pubkey: seller.publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: productPda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: pdaProductCounter,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: pdaCounter,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: pdaPrice,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: new web3.PublicKey(PROGRAM_ID),
    });

    transaction.add(instruction);

    try {
      const connection = getConnection();
      let txid = await web3.sendAndConfirmTransaction(connection, transaction, [
        seller,
      ]);
      alert(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=custom`,
      );
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=custom`,
      );
    } catch (e) {
      console.log(JSON.stringify(e));
      alert(JSON.stringify(e));
    }
  }

  return (
    <div>
      <Box
        p={4}
        display={{ md: "flex" }}
        maxWidth="32rem"
        borderWidth={1}
        margin={2}
        justifyContent="center"
      >
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel color="gray.200">Product price</FormLabel>
            <Input
              id="title"
              color="gray.400"
              onChange={(event) =>
                setPrice(parseFloat(event.currentTarget.value))
              }
              defaultValue={props.product.price}
            />
          </FormControl>
          <Button width="full" mt={4} type="submit">
            Update price
          </Button>
        </form>
      </Box>
      <Box
        p={4}
        display={{ md: "flex" }}
        maxWidth="32rem"
        borderWidth={1}
        margin={2}
        justifyContent="center"
      >
        <PriceList product={props.product} />
      </Box>
    </div>
  );
}
