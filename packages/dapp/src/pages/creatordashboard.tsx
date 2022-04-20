import { RepeatIcon } from "@chakra-ui/icons";
import { HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { Title } from "@moonshotcollective/ui";
import { useWeb3React } from '@web3-react/core';
import CreatorView from "components/custom/vCreateNft";
import React, { useContext, useEffect, useState } from "react";
import Faucet from "../components/custom/Faucet";
import { Web3Context } from "../contexts/Web3Provider";
import { hexToString } from "../core/helpers";
import useCustomColor from "../core/hooks/useCustomColor";

const CreatorDashboard = () => {
  const { account } = useContext(Web3Context);
  const { library } = useWeb3React();
  const { coloredText, accentColor } = useCustomColor();
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


      <CreatorView />
      
    </VStack>
  );
};

export default CreatorDashboard;
