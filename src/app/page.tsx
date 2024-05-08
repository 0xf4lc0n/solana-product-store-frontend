import { AddProduct } from "@/components/add-product";
import { ProductList } from "@/components/product-list";
import { Box, Center, ChakraProvider, Heading } from "@chakra-ui/react";
import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Product store</title>
      </Head>
      <Center>
        <Box>
          <Heading as="h1" size="l" color="white" ml={4} mt={8}>
            Add product
          </Heading>
          <AddProduct />
          <Heading as="h1" size="l" color="white" ml={4} mt={8}>
            Existing products
          </Heading>
          <ProductList />
        </Box>
      </Center>
    </div>
  );
}
