import { RepeatIcon } from "@chakra-ui/icons";
import { HStack, IconButton, Text, VStack } from "@chakra-ui/react";

import { useWeb3React } from '@web3-react/core';
import ContractFields from "components/custom/ContractFields";
import React, { useContext, useEffect, useState } from "react";
import Faucet from "../components/custom/Faucet";
import { Web3Context } from "../contexts/Web3Provider";
import { hexToString } from "../core/helpers";


const Home = () => {
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
      <Text textStyle="h2">
       All about contract functions
      </Text>

      <HStack>
        <Text>Your Balance: {yourBalance}Ξ</Text>
        <IconButton
          onClick={getEthBalance}
          aria-label="refresh"
          icon={<RepeatIcon />}
        />
      </HStack>

      
      <ContractFields />
    
    </VStack>
  );
};

export default Home;
