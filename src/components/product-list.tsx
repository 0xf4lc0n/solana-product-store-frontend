"use client";
import { ProductCoordinator } from "@/coordinators/product-coordinator";
import { Product } from "@/models/product";
import { getConnection } from "@/utils/common";
import {
  Button,
  Center,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { UpdateProduct } from "./update-product";
import { UpdatePrice } from "./update-price";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const allProducts = useRef<Product[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const setUp = async () => {
      const products = await ProductCoordinator.fetchPage(
        getConnection(),
        page,
        10
      );
      const sortedProducts = products.sort((p1, p2) => p1.id - p2.id);
      setProducts(sortedProducts);
      allProducts.current = sortedProducts;
    };

    setUp();
  }, [page]);

  useEffect(() => {
    if (search) {
      setProducts((products) =>
        products.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setProducts(allProducts.current);
    }
  }, [search]);

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

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Name</Th>
              <Th>Price</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((product, i) => (
              <Tr
                key={i}
                onClick={() => {
                  setSelectedProduct(product);
                  onOpen();
                }}
              >
                <Td>{product.id.toString()}</Td>
                <Td>{product.name}</Td>
                <Td>{product.price}$</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Product details - <b>{selectedProduct?.name}</b>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <h1>Change product price</h1>
            <UpdatePrice product={selectedProduct!} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
