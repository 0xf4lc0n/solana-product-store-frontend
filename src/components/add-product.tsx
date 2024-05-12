"use client";

import * as web3 from "@solana/web3.js";
import BN from "bn.js";
import { Product } from "@/models/product";
import { PROGRAM_ID, getConnection, getSigner } from "@/utils/common";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { ProductCoordinator } from "@/coordinators/product-coordinator";

export function AddProduct() {
  //const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0.0);
  const seller = getSigner();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [transactionId, setTransactionId] = useState("");

  function handleSubmit(event: any) {
    event.preventDefault();
    //TODO: Fetch product ID

    ProductCoordinator.syncPriceCount(getConnection(), seller.publicKey).then(
      async (count) => {
        console.log("Product count: ", count);
        const product = new Product(seller.publicKey, count + 1, name, price);
        await handleTransactionSubmit(product);
      }
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
      new web3.PublicKey(PROGRAM_ID)
    );

    const [pdaProductCounter] = await web3.PublicKey.findProgramAddress(
      [seller.publicKey.toBuffer(), Buffer.from("product_counter")],
      new web3.PublicKey(PROGRAM_ID)
    );

    const [pdaCounter] = await web3.PublicKey.findProgramAddress(
      [product_pda.toBuffer(), Buffer.from("price")],
      new web3.PublicKey(PROGRAM_ID)
    );

    const [pdaPrice] = await web3.PublicKey.findProgramAddress(
      [product_pda.toBuffer(), new BN(0).toArrayLike(Buffer, "be", 8)],
      new web3.PublicKey(PROGRAM_ID)
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
      setTransactionId(txid);
      onOpen();
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=custom`
      );
      setName("");
      setPrice(0.0);
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
          <FormLabel color="gray.400">Product name</FormLabel>
          <Input
            id="title"
            color="gray.600"
            onChange={(event) => setName(event.currentTarget.value)}
            value={name}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.400">Product price</FormLabel>
          <Input
            id="title"
            color="gray.600"
            onChange={(event) =>
              setPrice(parseFloat(event.currentTarget.value) || 0)
            }
            value={price}
          />
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Submit product
        </Button>
      </form>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Success</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Transaction: <br />
            <b>{transactionId}</b>
            <br />
            was submitted successfully. You can check it{" "}
            <Link
              href={`https://explorer.solana.com/tx/${transactionId}?cluster=custom`}
              isExternal
            >
              here <ExternalLinkIcon mx="2px" />
            </Link>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
