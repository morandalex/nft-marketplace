import { RepeatIcon } from "@chakra-ui/icons";
import { HStack, Heading,IconButton, Text, VStack } from "@chakra-ui/react";

import { useWeb3React } from '@web3-react/core';
import NftMarketplaceView from "components/custom/vNftMarketplace";
import React, { useContext, useEffect, useState } from "react";

import { Web3Context } from "../contexts/Web3Provider";
import { hexToString } from "../core/helpers";


const NftMarketplacePage = () => {
  const { account } = useContext(Web3Context);
  const { library } = useWeb3React();

  const [yourBalance, setYourBalance] = useState("");

  const getEthBalance = async () => {
    if (library && account) {
      const res = await library?.getBalance(account);
      const balance = hexToString(res);
      setYourBalance(balance);
      // console.log(`balance`, balance);
    }
  };

  useEffect(() => {
    getEthBalance();
  }, [account, library]);

  return (
    <VStack>
       <Heading as="h1">
       Marketplace
      </Heading>
 
      <NftMarketplaceView />

    </VStack>
  );
};

export default NftMarketplacePage;
