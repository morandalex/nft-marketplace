import { Button, Image, Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { BigNumber, utils } from "ethers";
import ABIS from "../../hardhat_contracts.json";
import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { Web3Context } from "../../contexts/Web3Provider";

import NETWORKS from "../../core/networks";
import { YourContract } from "../../YourContract";
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
  const { contracts, account } = useContext(Web3Context);
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);
  const [marketItems, setMarketItems] = useState([]);

  const [fetchMyNFTs, setFetchMyNFTs] = useState([]);
  const [tokenURIInput, setTokenURIInput] = useState("");
  const [createNftInput, setCreateNftInput] = useState("");
  const [yourReadContract, setYourReadContract] = useState<YourContract>();
  const [yourWriteContract, setYourWriteContract] = useState<YourContract>();
const [selectedTokenId,setSelectedTokenId]=useState('');
  const [priceInput, setPriceInput] = useState('0.01');
  const [nfts, setNfts] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure()
  useEffect(() => {
    if (chainId && contracts) {
      setFetchMyNFTs([]);
      setTokenURIInput('')
      const strChainId = chainId.toString() as keyof typeof NETWORKS;
      const network = NETWORKS[strChainId];
      const abis = ABIS as Record<string, any>;
      if (abis[strChainId]) {
        //   console.log(abis)
        const abi = abis[strChainId][network.name].contracts.YourContract.abi;
        setAbi(abi);
        setYourReadContract(contracts.yourReadContract);
        setYourWriteContract(contracts.yourWriteContract);
      }

    }
  }, [chainId, contracts]);
  useEffect(() => {
    if (chainId && yourReadContract) {
      getMyNft()
    }
  }, [chainId, yourReadContract])
  useEffect(() => {
    getMyNft()
  }, [account]);



  async function sellFun(tokenid: any) {

    // console.log(tokenid)
    if (yourWriteContract && yourReadContract) {
      try {
        let listingPrice = await yourReadContract.getListingPrice()


        const transaction = await yourWriteContract.resellToken(tokenid, utils.parseEther(priceInput.toString()), { value: listingPrice });
        await transaction.wait();
        await getMyNft()
      }
      catch (e: any) {if (e.data){ alert(e.message+'\n'+e.data.message)}else { alert(e.message)} }
    }

  }

  async function getMyNft() {
    if (yourReadContract) {
      try {
        const data: any = await yourReadContract.fetchMyNFTs();
        // console.log('->', res)


        const items: any = await Promise.all(data.map(async (i: any) => {


          let tokenUri: any;
          try {
            tokenUri = await yourReadContract.tokenURI(i.tokenId)
          }
          catch (e: any) {if (e.data){ alert(e.message+'\n'+e.data.message)}else { alert(e.message)} }
          let price = utils.formatUnits(i.price.toString(), 'ether')

          const item = await fetch(tokenUri)
            .then(response => response.json())
            .then(data => {
              let item = {
                price,
                perc:i.perc,
                tokenId: i.tokenId.toNumber(),
                creator:i.creator,
                seller: i.seller,
                owner: i.owner,
                image: data.image,
              }
              return item
            });

          return item

        }))

        setNfts(items)

      }  
      catch (e: any) {if (e.data){ alert(e.message+'\n'+e.data.message)}else { alert(e.message)} }
    }

  }

  function onOpenModalFun(tokenid: any){
    onOpen()
    setSelectedTokenId(tokenid)
  }


  return (
    <VStack
      bg="spacelightalpha"
      p="8"
      h="lg"
      borderRadius="base"
      spacing="4"
      align="start"
      {...others}
    >

      <Text>Here you have your  nft</Text>
      <VStack>


     



        <Box
          display="flex"
          flexDirection='column'
          justifyContent="space-between"
          alignItems="center"
          textAlign="center"
        >


          {
            nfts && nfts.map((item, i) => {

              return (<>
                <Box
                  p='2'
                  m='2'
                  border='1px' borderColor='gray.200'
                  alignItems='center'
                  justifyContent='center'
                  display='flex'
                  flexDirection='column'
                  borderRadius='16'
                >
                  <Image
                    src={item.image}
                    h='100px'
                  />
                <Text textAlign='center'> Nft Id:{item.tokenId}</Text>
                          <Text textAlign='center'> Price:{item.price}</Text>
                          <Text textAlign='center'> Creator: {item.creator.substr(0, 6) + "..." + item.creator.substr(-4)}</Text>
                          <Text textAlign='center'> PercToCreator: {item.perc.toString()}</Text>
                          <Text textAlign='center'> Seller: {item.seller.substr(0, 6) + "..." + item.seller.substr(-4)}</Text>
                          <Text textAlign='center'> Owner: {item.owner.substr(0, 6) + "..." + item.owner.substr(-4)}</Text>
                 
                  <Button onClick={()=>onOpenModalFun(item.tokenId)}>Sell</Button>

                </Box>


              
    

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
      
          <ModalCloseButton />
          <ModalBody>
          <Text>Set a price</Text>
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
          </ModalBody>

          <ModalFooter>
          <Button key={i} onClick={() => sellFun(selectedTokenId)} >Sell</Button>
           
          
          </ModalFooter>
        </ModalContent>
      </Modal>

              </>)
            })
          }
        </Box>
      </VStack>

    </VStack>
  );
}
export default ContractFields;
