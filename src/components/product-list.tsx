"use client";
import { ProductCoordinator } from "@/coordinators/product-coordinator";
import { Product } from "@/models/product";
import { getConnection } from "@/utils/common";
import {
  Button,
  Center,
  HStack,
  Heading,
  Input,
  Spacer,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    ProductCoordinator.fetchPage(getConnection(), page, 10).then(setProducts);
  }, [page]);

  return (
    <div>
      <Center>
        <Input
          id="search"
          color="gray.400"
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search"
          w="97%"
          mt={2}
          mb={2}
        />
      </Center>

      {products.map((product, i) => (
        <p key={i}>
          {product.name} {product.price}
        </p>
      ))}

      <Center>
        <HStack w="full" mt={2} mb={8} ml={4} mr={4}>
          {page > 1 && (
            <Button onClick={() => setPage(page - 1)}>Previous</Button>
          )}
          <Spacer />
          {ProductCoordinator.accounts.length > page * 2 && (
            <Button onClick={() => setPage(page + 1)}>Next</Button>
          )}
        </HStack>
      </Center>
    </div>
  );
}
