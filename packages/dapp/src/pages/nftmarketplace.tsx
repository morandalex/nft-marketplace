import { RepeatIcon } from "@chakra-ui/icons";
import { HStack, IconButton, Text, VStack } from "@chakra-ui/react";

import { useWeb3React } from '@web3-react/core';
import NftMarketplaceView from "components/custom/vNftMarketplace";
import React, { useContext, useEffect, useState } from "react";
import Faucet from "../components/custom/Faucet";
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
     
 
      <NftMarketplaceView />
   
    </VStack>
  );
};

export default NftMarketplacePage;
