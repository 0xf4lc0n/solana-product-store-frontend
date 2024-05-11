"use client";

import * as web3 from "@solana/web3.js";
import BN from "bn.js";
import { Product } from "@/models/product";
import { PROGRAM_ID, getConnection, getSigner } from "@/utils/common";
import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { ProductCoordinator } from "@/coordinators/product-coordinator";

export function AddProduct() {
  //const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0.0);
  const seller = getSigner();

  function handleSubmit(event: any) {
    event.preventDefault();
    //TODO: Fetch product ID

    ProductCoordinator.syncPriceCount(getConnection(), seller.publicKey).then(
      async (count) => {
        console.log("Product count: ", count);
        const product = new Product(seller.publicKey, count + 1, name, price);
        await handleTransactionSubmit(product);
      },
    );
  }

  async function handleTransactionSubmit(product: Product) {
    const buffer = product.serialize(0);
    const transaction = new web3.Transaction();

    const [product_pda] = await web3.PublicKey.findProgramAddress(
      [
        seller.publicKey.toBuffer(),
        new BN(product.id).toArrayLike(Buffer, "be", 8),
      ],
      new web3.PublicKey(PROGRAM_ID),
    );

    const [pdaProductCounter] = await web3.PublicKey.findProgramAddress(
      [seller.publicKey.toBuffer(), Buffer.from("product_counter")],
      new web3.PublicKey(PROGRAM_ID),
    );

    const [pdaCounter] = await web3.PublicKey.findProgramAddress(
      [product_pda.toBuffer(), Buffer.from("price")],
      new web3.PublicKey(PROGRAM_ID),
    );

    const [pdaPrice] = await web3.PublicKey.findProgramAddress(
      [product_pda.toBuffer(), new BN(0).toArrayLike(Buffer, "be", 8)],
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
          pubkey: product_pda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: pdaProductCounter,
          isSigner: false,
          isWritable: true,
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
          <FormLabel color="gray.200">Product name</FormLabel>
          <Input
            id="title"
            color="gray.400"
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">Product price</FormLabel>
          <Input
            id="title"
            color="gray.400"
            onChange={(event) =>
              setPrice(parseFloat(event.currentTarget.value))
            }
          />
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Submit product
        </Button>
      </form>
    </Box>
  );
}
