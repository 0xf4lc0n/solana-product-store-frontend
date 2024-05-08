import { Product } from "@/models/product";
import { PROGRAM_ID, getConnection, getSigner } from "@/utils/common";
import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import BN from "bn.js";

export function UpdateProduct(props: { product: Product }) {
  const [name, setName] = useState(props.product.name);
  const seller = getSigner();

  function handleSubmit(event: any) {
    event.preventDefault();
    const op = props.product;
    const product = new Product(op.seller, op.id, name, op.price);
    handleTransactionSubmit(product);
  }

  async function handleTransactionSubmit(newProduct: Product) {
    const buffer = newProduct.serialize(1);
    const transaction = new web3.Transaction();

    const [product_pda] = await web3.PublicKey.findProgramAddress(
      [
        seller.publicKey.toBuffer(),
        new BN(newProduct.id).toArrayLike(Buffer, "be", 8),
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
          pubkey: product_pda,
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
            defaultValue={props.product.name}
          />
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Update product
        </Button>
      </form>
    </Box>
  );
}
