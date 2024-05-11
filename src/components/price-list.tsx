import { PriceCoordinator } from "@/coordinators/price-coordinator";
import { Price } from "@/models/price";
import { Product } from "@/models/product";
import { getConnection } from "@/utils/common";
import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Spacer,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function PriceList(props: { product: Product }) {
  const [page, setPage] = useState(1);
  const [prices, setPrices] = useState<Price[]>([]);

  useEffect(() => {
    const fetch = async () => {
      props.product.publicKey().then(async (product) => {
        const prices = await PriceCoordinator.fetchPage(
          getConnection(),
          product,
          page,
          10,
        );
        setPrices(prices);
      });
    };
    fetch();
  }, [page]);

  return (
    <div>
      <Heading as="h1" size="l" ml={4} mt={2}>
        Price history
      </Heading>
      {prices.map((price, i) => (
        <Box
          key={i}
          p={4}
          textAlign={{ base: "left", md: "left" }}
          display={{ md: "flex" }}
          maxWidth="32rem"
          borderWidth={1}
          margin={2}
        >
          <div>
            {price.price} {price.timestamp.toString()}
          </div>
        </Box>
      ))}

      <Stack>
        <Center>
          <HStack w="full" mt={2} mb={8} ml={4} mr={4}>
            {page > 1 && (
              <Button onClick={() => setPage(page - 1)}>Previous</Button>
            )}
            <Spacer />
            {PriceCoordinator.priceCount > page * 10 && (
              <Button onClick={() => setPage(page + 1)}>Next</Button>
            )}
          </HStack>
        </Center>
      </Stack>
    </div>
  );
}
