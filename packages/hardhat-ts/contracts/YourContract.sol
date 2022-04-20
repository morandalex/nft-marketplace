// SPDX-License-Identifier: MIT
//RINKEBY 0x3797dAE6d3800df38640D6d3247d77d548C30050
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

interface IERC20 {
    function transfer(address _to, uint256 _amount) external returns (bool);
    function balanceOf(address tokenOwner) external returns (uint balance);
}

//
contract YourContract is ERC721URIStorage {
    //usando l'oggetto contatore
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    
    // contatore per creaizone di un codice per tokenid
    Counters.Counter private _tokenIds;

    // contatore che conta gli item venduti
    Counters.Counter private _itemsSold;

    //creazione del prezzo di listino di partenza ( fisso )
    uint256  listingPrice  = 0.001 ether;

    // creazione di indirizzo del proprietario del contratto
    address payable owner;

    // lista associazioni codiceid-prodotto--> il prodotto è una tabella
    mapping(uint256 => MarketItem) private idToMarketItem;

    // creazione della tabella di prodotto ( che puo essere un NFT )
    struct MarketItem {
        uint256 tokenId; // codice del prodotto
        address payable creator; // il creatore dell'NFT
       
        address payable seller; // chi ha venduto
        address payable owner; // chi è il proprietario

        uint256 perc; // percentuale pagata al creatore sul prezzo di vendita
        uint256 price; // prezzo
        bool sold; // se venduto
    }

    // inizializzazione della tabella di prodotto ( che puo essere un NFT )
    event MarketItemCreated(
        uint256 indexed tokenId, //  codice del prodotto
        address creator , //creator
        address seller, // chi ha venduto
        address owner, // chi è il proprietario
        uint256 perc, //percentuale pagata al creatore
        uint256 price, // prezzo
        bool sold // se venduto
    );

    //  costruttore del contratto che è un ERC721 con parametri defini all'inizializzazione
    //constructor(string memory _name, string memory _symbol)
 constructor()
        ERC721("A Beat Beyond NFT Mrketplace","ABBNFT")
    {
        owner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    function updateListingPrice(uint256 _listingPrice) public payable {
        require(
            owner == msg.sender,
            "Only marketplace owner can update listing price."
        );
        listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Mints a token and lists it in the marketplace */
    function createNft(string memory tokenURI, uint256 price,uint256 perc) public payable returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createMarketItem(newTokenId, price,perc);
        return newTokenId;
    }
    /* function recalled by createNft*/
    function createMarketItem(uint256 tokenId, uint256 price,uint256 perc) private {
        require(price >= 1000000000000000, "Price must be at least 1000000000000000 wei =  0.001 ether");
        require(
            msg.value >= listingPrice,
            "Price must be equal to listing price"
        );
        require(perc >0,"Percentage must be > 0");
        require(perc <1000,"Percentage must be < 1000");

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(msg.sender),
            payable(address(this)),
            perc,
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            msg.sender,
            address(this),
            perc,
            price,
            false
        );
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        require(
            msg.value >= listingPrice,
            "Price must be equal to listing price"
        );
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));
        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function buy(uint256 tokenId) public payable {
        uint256 price = idToMarketItem[tokenId].price;
        require(
            msg.value >= price,
            "Please submit the asking price in order to complete the purchase"
        );
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
       
        _itemsSold.increment();
        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);

        uint256 perc = idToMarketItem[tokenId].perc;
        
        uint256 toSeller=msg.value * (1000 - perc).div(1000);
        
        payable(idToMarketItem[tokenId].seller  ).transfer(toSeller );
        
        payable(idToMarketItem[tokenId].creator ).transfer( msg.value - toSeller);
        
        idToMarketItem[tokenId].seller = payable(address(0));
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function deposit() external payable {
        require(msg.value >= 1000000000000000 , "Please > 0.01 ether");
    }

    function withdraw() external {
        require(msg.sender == owner, "Msg.sender is not the owner");
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawToken(address _tokenContract) external {

         require(msg.sender == owner, "Msg.sender is not the owner");
         
        IERC20 tokenContract = IERC20(_tokenContract);

        // transfer the token from address of this contract
        // to address of the user (executing the withdrawToken() function)
        tokenContract.transfer(msg.sender, tokenContract.balanceOf(address(this)));
    }

    function balance() external view returns (uint256 balanceEth) {
        balanceEth = address(this).balance;
    }
}