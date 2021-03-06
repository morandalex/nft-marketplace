import { Button, HStack, Input, Textarea, Text, VStack, Box } from "@chakra-ui/react";
import { BigNumber, utils } from "ethers";
import ABIS from "../../hardhat_contracts.json";
import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { Web3Context } from "../../contexts/Web3Provider";

import NETWORKS from "../../core/networks";
import { YourContract } from "../../contract-types/YourContract";
import { useWeb3React } from '@web3-react/core';
import { create } from "ipfs-http-client";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'



//OPTION 1 : INFURA CONFIUGURATION FOR PROJECT < 5 GB
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_PROJECT_SECRET;

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
// @ts-ignore
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth
  }
})
function CreateNft({ ...others }: any) {
  const { contracts } = useContext(Web3Context);
  const { chainId } = useWeb3React();
  const [abi, setAbi] = useState([]);

  const [name, setName] = useState("");
  const [marketItems, setMarketItems] = useState([]);
  const [buyInput, setBuyInput] = useState("");
  const [createNftInput, setCreateNftInput] = useState("");
  const [yourReadContract, setYourReadContract] = useState<YourContract>();
  const [yourWriteContract, setYourWriteContract] = useState<YourContract>();

  const [fileUrl, setFileUrl] = useState('')
  const [formInput, updateFormInput] = useState({ price: '0.01', perc: '1', name: '', description: '' })
  const [listingPrice, setListingPrice] = useState('');

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
      fetchListingPriceFun()


    }
  }, [chainId, yourReadContract])


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
  
  async function onChange(e: any) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }
  async function uploadToIPFS() {
    const { name, description, price, perc } = formInput
    console.log(name, description, price, fileUrl)
    if (!name || !description || !price || !fileUrl || !perc) return

    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    console.log('ciao1')
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log('ciao2')
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }

  }
  async function listNFTForSale() {
    console.log('ok')
    const url = await uploadToIPFS()
    console.log('url: ', url)
    if (url) {
      if (yourWriteContract && yourReadContract && url) {
        try {


          let l = await yourReadContract.getListingPrice()

          const transaction = await yourWriteContract.createNft(url, utils.parseEther(formInput.price), formInput.perc, { value: l});
          await transaction.wait();
          //await fetchMarketItemsFun()
        }
        catch (e: any) { if (e.data) { alert(e.message + '\n' + e.data.message) } else { alert(e.message) } }
      }
    }
    else {
      alert('please fill the form')
    }
  }

  return (
    <>
      <Text >Here you can mint and sell a NFT.</Text>
      


      <Text>For each minting you have to pay the listing fee decided by the contract owner.</Text>
      <Text>Listing price:{' '} {listingPrice && utils.formatUnits(listingPrice, 'ether')}{' '}?? </Text>
      <Text>In order to mint NFTs, follow the procedure below.</Text>

      <Box
        p='4'
        m='2'
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        textAlign='center'
        border='1px'
        borderRadius='16'
      >

        <Text ><b>#Step1</b>: Set a name and a description for your NFT</Text>

        <Input
          m='1'
          placeholder="NFT Name"

          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <Textarea
          m='1'
          placeholder="nft Description"

          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />

        <Text mt='5'><b>#Step2</b>: Set a price between 0.01 and 20</Text>

        <NumberInput
          defaultValue={0.01}
          precision={2}
          step={0.01}
          value={formInput.price}
          //onChange={(e)=>  setPriceInput(e)}
          min={0.01}
          max={20}

          onChange={e => updateFormInput({ ...formInput, price: e })}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Text mt='5'><b>#Step3</b>: Set a percentage between 001 and 999. l </Text>
        <Text>It represents the royalty paid to you each time there is a sel</Text>
        <NumberInput
          defaultValue={1}
          precision={0}
          step={1}
          value={formInput.perc}
          //onChange={(e)=>  setPriceInput(e)}
          min={1}
          max={999}

          onChange={e => updateFormInput({ ...formInput, perc: e })}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>


        <Text mt='5'><b>#Step4</b>:Choose your amazing nft file</Text>
        <Input
          p='1'
          type="file"
          name="Asset"

          onChange={onChange}
        />





        <Button mt='8' onClick={() => listNFTForSale()} >
          Create NFT
        </Button>
      </Box>

    </>
  );
}
export default CreateNft;
