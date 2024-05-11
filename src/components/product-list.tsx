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
import { useEffect, useState } from "react";
import { UpdateProduct } from "./update-product";
import { UpdatePrice } from "./update-price";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
                <Td>{product.price}</Td>
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
          <ModalHeader>Product details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <h1>Update product data</h1>
            <UpdateProduct product={selectedProduct!} />
            <h1>Change product price</h1>
            <UpdatePrice product={selectedProduct!} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
