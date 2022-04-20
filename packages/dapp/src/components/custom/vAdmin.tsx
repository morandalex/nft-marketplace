import { Button,Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import ABIS from "../../hardhat_contracts.json";
import { BigNumber, utils } from "ethers";
import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { Web3Context } from "../../contexts/Web3Provider";

import NETWORKS from "../../core/networks";
import { YourContract } from "../../contract-types/YourContract";
import { useWeb3React } from '@web3-react/core';
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

function ContractFields({ ...others }: any) {
  const { contracts } = useContext(Web3Context);
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);

  const [yourReadContract, setYourReadContract] = useState<YourContract>();
  const [yourWriteContract, setYourWriteContract] = useState<YourContract>();
  const [priceInput, setPriceInput] = useState('0.01');
  const [listingPrice, setListingPrice] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure()
  async function fetchListingPriceFun() {
    if (yourReadContract) {
      try {
        let res: any;
        try {
          res = await yourReadContract.getListingPrice();

        }
        catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
        //console.log(res)
        setListingPrice(res.toString());

      } catch (err: any) {
        alert(err.message);
      }
    }
  }
  async function withdraw() {
    if (yourReadContract) {

      let res: any;
      try {
        res = await yourReadContract.withdraw();

      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }

    }
  }
  async function withdrawTokenFun(address: any) {
    if (yourReadContract) {

      let res: any;
      try {
        res = await yourReadContract.withdrawToken(address);

      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }

    }
  }

  async function updateListingPriceFun() {


    if (yourWriteContract) {


      try {
        const transaction = await yourWriteContract.updateListingPrice(utils.parseEther(priceInput.toString()));
        await transaction.wait();
        await fetchListingPriceFun()
      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
    }

  }

  useEffect(() => {
    if (chainId && contracts) {

      const strChainId = chainId.toString() as keyof typeof NETWORKS;
      const network = NETWORKS[strChainId];
      const abis = ABIS as Record<string, any>;


      if (abis[strChainId]) {
        console.log(abis)
        const abi = abis[strChainId][network.name].contracts.YourContract.abi;
        setAbi(abi);
        setYourReadContract(contracts.yourReadContract);
        setYourWriteContract(contracts.yourWriteContract);
      }
    }
  }, [chainId, contracts]);
  useEffect(() => {
    if (chainId && yourReadContract) {
      fetchListingPriceFun()


    }
  }, [chainId, yourReadContract])

  return (
    <> <Text textStyle="small">
    Here you can setup admin operations
  </Text>
  <Box
        p='4'
        m='2'
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        textAlign='center'

      >

     
      <Text>Listing price:{' '} {listingPrice && utils.formatUnits(listingPrice, 'ether')}{' '}Ξ </Text>

      {abi &&
        abi.map((el: any) => {
          if (el.type === "function" && el.inputs?.length !== 0 && el.name == 'updateListingPrice') {
            return (
              <HStack m='4' key={el.name}>
                <Text>{el.name}</Text>
                <NumberInput
                  defaultValue={0.01} precision={2} step={0.01}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e)}
                  min={0.01}
                  max={20}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
            

                <Button onClick={() => updateListingPriceFun()}> Update</Button>

              </HStack>
            );
          }




        })}


      <HStack m='4' p='2'>
        <Text>Withdraw ETh balance</Text>
        <Button onClick={() => withdraw()}> Withdraw</Button>
      </HStack>
      <HStack m='4' p= '2'>
        <Text>Withdraw ERC20 balance</Text>
        <Button onClick={() => onOpen()}> Withdraw erc20</Button>

      </HStack>







    </Box>
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>

          <ModalCloseButton />
          <ModalBody>
            <Text>Set a ERC20 address</Text>
            <Input
              placeholder="erc 20 address"

              onChange={e => setTokenAddress(e.target.value)}
            />

          </ModalBody>
          <Button onClick={() => withdrawTokenFun(tokenAddress)}> Withdraw erc20</Button>
          <ModalFooter>



          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ContractFields;
