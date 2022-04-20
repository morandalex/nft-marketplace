import { Button, Image, HStack, Input, Textarea, Text, VStack, Box } from "@chakra-ui/react";
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

type Block = {
  inputs?: Array<Object>;
  outputs?: Array<Object>;
  name?: string;
  stateMutability?: string;
  type: string;
};
function NftMarketplace({ ...others }: any) {
  const { contracts } = useContext(Web3Context);
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);

  const [name, setName] = useState("");
  const [marketItems, setMarketItems] = useState([]);
  const [buyInput, setBuyInput] = useState("");
  const [createNftInput, setCreateNftInput] = useState("");
  const [yourReadContract, setYourReadContract] = useState<YourContract>();
  const [yourWriteContract, setYourWriteContract] = useState<YourContract>();

  const [priceInput, setPriceInput] = useState('0.01');
  const [nfts, setNfts] = useState<any[]>([])

  useEffect(() => {
    if (chainId && contracts) {
      setName("");
      setBuyInput("");
      setCreateNftInput("");
      setMarketItems([])
      const strChainId = chainId.toString() as keyof typeof NETWORKS;
      const network = NETWORKS[strChainId];
      const abis = ABIS as Record<string, any>;
      if (abis[strChainId]) {
        // console.log(abis)
        const abi = abis[strChainId][network.name].contracts.YourContract.abi;
        setAbi(abi);
        setYourReadContract(contracts.yourReadContract);
        setYourWriteContract(contracts.yourWriteContract);
      }
    }
  }, [chainId, contracts]);
  useEffect(() => {
    if (chainId && yourReadContract) {
      fetchMarketItemsFun()
    }
  }, [chainId, yourReadContract])




  async function fetchMarketItemsFun() {
    if (yourReadContract) {
      try {
        const data: any = await yourReadContract.fetchMarketItems();
        //console.log(res)

        console.log(data);
        const items: any = await Promise.all(data.map(async (i: any) => {
          let tokenUri: any;
          try {

            tokenUri = await yourReadContract.tokenURI(i.tokenId)
          }
          catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
          let price = utils.formatUnits(i.price.toString(), 'ether')

console.log('------------>',tokenUri.substr(0, 4))
          if (tokenUri.substr(0, 4) == 'http') {
            const item = await fetch(tokenUri)
              .then(response => response.json())
              .then(data => {
                let item = {
                  price,
                  perc: i.perc,
                  tokenId: i.tokenId.toNumber(),
                  creator: i.creator,
                  seller: i.seller,
                  owner: i.owner,
                  image: data.image,
                }
                return item
              });


            return item
          }
          else {
            return {
              price,
              perc: i.perc,
              tokenId: i.tokenId.toNumber(),
              creator: i.creator,
              seller: i.seller,
              owner: i.owner,
              image: '',
            }
          }

        }))

        setNfts(items)



      } catch (err: any) {
        console.log(err);
        alert(err.message)
      }
    }
  }


  async function buyFun(tokenid: any, price: any) {

    console.log(tokenid)
    if (yourWriteContract) {

      try {
        const transaction = await yourWriteContract.buy(tokenid, { value: price });
        await transaction.wait();
        await fetchMarketItemsFun()
      }
      catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }


    }

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

      <Text >
        marketplace
      </Text>




      {abi &&
        abi.map((el: Block, i) => {

          if (el.type === "function" && el.outputs?.length !== 0 && el.name == 'fetchMarketItems') {
            return (

              <>
                <Box
                  display="flex"
                  flexDirection='column'
                  justifyContent="space-between"
                  alignItems="center"
                  textAlign="center"
                >



                  {
                    nfts.map((item, i) => {

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

                            src={item && item.image}
                            h='100px'
                          />
                          <Text textAlign='center'> Nft Id:{item && item.tokenId}</Text>
                          <Text textAlign='center'> Price:{item && item.price}</Text>
                          <Text textAlign='center'> Creator: {item && item.creator.substr(0, 6) + "..." + item.creator.substr(-4)}</Text>
                          <Text textAlign='center'> PercToCreator: {item && item.perc.toString()}</Text>
                          <Text textAlign='center'> Seller: {item && item.seller.substr(0, 6) + "..." + item.seller.substr(-4)}</Text>
                          <Text textAlign='center'> Owner: {item && item.owner.substr(0, 6) + "..." + item.owner.substr(-4)}</Text>
                          <Button key={i} onClick={() => el.name && buyFun(item.tokenId, utils.parseEther(item.price))} >Buy</Button>
                        </Box>



                      </>)
                    })
                  }
                </Box>
              </>

            );
          }
        })}

      {
        /*
      nfts.map(item => {

        return (<Text>{JSON.stringify(item)}</Text>)
      })
         <Button onClick={() => fetchMarketItemsFun()}>get</Button>
      */
      }

    </VStack>
  );
}
export default NftMarketplace;
