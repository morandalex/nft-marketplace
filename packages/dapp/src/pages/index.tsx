import { RepeatIcon } from "@chakra-ui/icons";
import { Heading, Box,HStack, IconButton, Text, VStack } from "@chakra-ui/react";

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
      <Heading as="h1">
       Nft marketplace
      </Heading>

      
      <Text>
        Built with @scaffold-moonshot-starter
        </Text>
     <Box
     color='black'
     textAlign='center'
     >
This nft marketplace is connected to  a contract that is able to manage 3 actors: the creators, the buyers, a contract owner.<br></br>
The contract owner allows creators to mint NFT at a listing price cost.<br></br>
The creators collects royalties on the sells of their NFTs.<br></br>
The Buyers use the marketplace to buy NFTs.<br></br>
If a buyer owns a NFTs can decide to resell it at the listing price cost.<br></br>
Per each sell , we have the payment splitted between the creators and the NFT owner.<br></br>
Click on page links on top to start using this dapp with rinkeby or mumbai testnets


     </Box>
      
    
    </VStack>
  );
};

export default Home;
