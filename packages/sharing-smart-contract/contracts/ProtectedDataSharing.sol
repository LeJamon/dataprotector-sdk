// SPDX-License-Identifier: Apache-2.0

/******************************************************************************
 * Copyright 2020 IEXEC BLOCKCHAIN TECH                                       *
 *                                                                            *
 * Licensed under the Apache License, Version 2.0 (the "License");            *
 * you may not use this file except in compliance with the License.           *
 * You may obtain a copy of the License at                                    *
 *                                                                            *
 *     http://www.apache.org/licenses/LICENSE-2.0                             *
 *                                                                            *
 * Unless required by applicable law or agreed to in writing, software        *
 * distributed under the License is distributed on an "AS IS" BASIS,          *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   *
 * See the License for the specific language governing permissions and        *
 * limitations under the License.                                             *
 ******************************************************************************/
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ERC721Receiver.sol";
import "./ManageOrders.sol";
import "./interface/IProtectedDataSharing.sol";
import "./interface/IRegistry.sol";

contract ProtectedDataSharing is
    Initializable,
    ERC721BurnableUpgradeable,
    ERC721Receiver,
    ManageOrders,
    AccessControlUpgradeable,
    IProtectedDataSharing
{
    // ---------------------Collection state------------------------------------
    IRegistry private protectedDataRegistry;
    IRegistry private appRegistry;
    uint256 private _nextCollectionId;
    //collectionId => (ProtectedDataTokenId => ProtectedDataAddress)
    mapping(uint256 => mapping(uint160 => address)) public protectedDatas;
    // collectionId => (protectedDataAddress: address => App:address)
    mapping(uint256 => mapping(address => address)) public appForProtectedData;
    // collectionId => protectedtedDataNumber
    mapping(uint256 => uint256) public protectedDataInCollection;

    // ---------------------Subscription state----------------------------------
    // collectionId => (protectedDataAddress: address => inSubscription: bool)
    mapping(uint256 => mapping(address => bool)) public protectedDataInSubscription;
    // collectionId => (subscriberAddress => endTimestamp(48 bit for full timestamp))
    mapping(uint256 => mapping(address => uint48)) public subscribers;
    // collectionId => subscriptionParams:  SubscriptionParams
    mapping(uint256 => SubscriptionParams) public subscriptionParams;
    // collectionId => last subsciption end timestamp
    mapping(uint256 => uint48) public lastSubscriptionExpiration;

    // ---------------------Rental state----------------------------------
    // collectionId => (protectedDataAddress: address => rentingParams: RentingParams)
    mapping(uint256 => mapping(address => RentingParams)) public protectedDataForRenting;
    // protectedData => (RenterAddress => endTimestamp(48 bit for full timestamp))
    mapping(address => mapping(address => uint48)) public renters;
    // protectedData => last rental end timestamp
    mapping(address => uint48) public lastRentalExpiration;

    // ---------------------Sale state----------------------------------
    // collectionId => (protectedDataAddress: address => sellingParams: SellingParams)
    mapping(uint256 => mapping(address => SellingParams)) public protectedDataForSale;

    /***************************************************************************
     *                        Constructor                                      *
     ***************************************************************************/
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IExecPocoDelegate _proxy,
        IRegistry _appRegistry,
        IRegistry _protectedDataRegistry,
        address defaultAdmin
    ) public initializer {
        __ERC721_init("Collection", "CT");
        __ERC721Burnable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        updateEnv("ipfs", "https://result.v8-bellecour.iex.ec");
        m_pocoDelegate = _proxy;
        appRegistry = _appRegistry;
        protectedDataRegistry = _protectedDataRegistry;
    }

    /***************************************************************************
     *                        Modifiers                                        *
     ***************************************************************************/
    modifier onlyCollectionOwner(uint256 _collectionId) {
        require(msg.sender == ownerOf(_collectionId), "Not the collection's owner");
        _;
    }

    modifier onlyProtectedDataInCollection(uint256 _collectionId, address _protectedData) {
        require(
            protectedDatas[_collectionId][uint160(_protectedData)] != address(0),
            "ProtectedData is not in collection"
        );
        _;
    }

    modifier onlyCollectionNotSubscribed(uint256 _collectionId) {
        require(
            lastSubscriptionExpiration[_collectionId] < block.timestamp,
            "Collection has ongoing subscriptions"
        );
        _;
    }

    modifier onlyProtectedDataNotAvailableInSubscription(
        uint256 _collectionId,
        address _protectedData
    ) {
        require(
            protectedDataInSubscription[_collectionId][_protectedData] == false,
            "ProtectedData is available in subscription"
        );
        _;
    }

    modifier onlyProtectedDataNotRented(address _protectedData) {
        require(
            lastRentalExpiration[_protectedData] < block.timestamp,
            "ProtectedData is currently being rented"
        );
        _;
    }

    modifier onlyProtectedDataNotForRenting(uint256 _collectionId, address _protectedData) {
        require(
            protectedDataForRenting[_collectionId][_protectedData].isForRent == false,
            "ProtectedData available for renting"
        );
        _;
    }

    modifier onlyProtectedDataNotForSale(uint256 _collectionId, address _protectedData) {
        require(
            protectedDataForSale[_collectionId][_protectedData].isForSale == false,
            "ProtectedData for sale"
        );
        _;
    }

    /***************************************************************************
     *                        Functions                                        *
     ***************************************************************************/
    function consumeProtectedData(
        uint256 _collectionId,
        address _protectedData,
        IexecLibOrders_v5.WorkerpoolOrder calldata _workerpoolOrder,
        string calldata _contentPath
    ) external returns (bytes32) {
        bool isRented = renters[_protectedData][msg.sender] > block.timestamp;
        require(
            isRented ||
                (protectedDataInSubscription[_collectionId][_protectedData] &&
                    subscribers[_collectionId][msg.sender] > block.timestamp),
            "No valid rental or subscription"
        );
        address appAddress = appForProtectedData[_collectionId][_protectedData];
        require(
            appRegistry.ownerOf(uint256(uint160(appAddress))) == address(this),
            "ProtectedDataSharing contract doesn't own the app"
        );
        IexecLibOrders_v5.AppOrder memory appOrder = createAppOrder(
            _protectedData,
            appAddress,
            _workerpoolOrder.workerpool
        );
        IexecLibOrders_v5.DatasetOrder memory datasetOrder = createDatasetOrder(
            _protectedData,
            appAddress,
            _workerpoolOrder.workerpool
        );
        IexecLibOrders_v5.RequestOrder memory requestOrder = createRequestOrder(
            _protectedData,
            appAddress,
            _workerpoolOrder.workerpool,
            _workerpoolOrder.category,
            _contentPath
        );
        bytes32 dealid = m_pocoDelegate.matchOrders(
            appOrder,
            datasetOrder,
            _workerpoolOrder,
            requestOrder
        );
        mode _mode;
        if (isRented) {
            _mode = mode.RENTING;
        } else {
            _mode = mode.SUBSCRIPTION;
        }
        emit ProtectedDataConsumed(dealid, _mode);
        return dealid;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * Swaps a protected data ERC-721 token from one collection to another.
     * @param _collectionIdFrom The ID of the collection from which the protected data is being transferred.
     * @param _collectionIdTo The ID of the collection to which the protected data is being transferred.
     * @param _protectedData The address of the protected data being transferred.
     * @param _appAddress The address of the approved application to consume the protected data.
     */
    function _swapCollection(
        uint256 _collectionIdFrom,
        uint256 _collectionIdTo,
        address _protectedData,
        address _appAddress
    ) private {
        delete protectedDatas[_collectionIdFrom][uint160(_protectedData)];
        emit ProtectedDataRemovedFromCollection(_collectionIdFrom, _protectedData);
        protectedDatas[_collectionIdTo][uint160(_protectedData)] = _protectedData;
        emit ProtectedDataAddedToCollection(_collectionIdTo, _protectedData, _appAddress);
    }

    /**
     * Safely transfers a protected data item to a specified address.
     * @param _to The address to which the protected data is being transferred.
     * @param _protectedData The address of the protected data being transferred.
     */
    function _safeTransferFrom(address _to, address _protectedData) private {
        protectedDataRegistry.safeTransferFrom(
            address(this),
            _to,
            uint256(uint160(_protectedData))
        );
    }

    fallback() external payable {
        revert();
    }

    receive() external payable {
        revert();
    }

    /***************************************************************************
     *                         Admin                                           *
     ***************************************************************************/
    function updateEnv(
        string memory _iexec_result_storage_provider,
        string memory _iexec_result_storage_proxy
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        iexec_result_storage_provider = _iexec_result_storage_provider;
        iexec_result_storage_proxy = _iexec_result_storage_proxy;
    }

    /***************************************************************************
     *                        Collection                                       *
     ***************************************************************************/
    function _safeMint(address to) private {
        uint256 tokenId = _nextCollectionId++;
        _safeMint(to, tokenId);
    }

    /// @inheritdoc ICollection
    function createCollection() public returns (uint256) {
        uint256 tokenId = _nextCollectionId;
        _safeMint(msg.sender);
        return tokenId;
    }

    /// @inheritdoc ICollection
    function removeCollection(uint256 _collectionId) public onlyCollectionOwner(_collectionId) {
        require(protectedDataInCollection[_collectionId] == 0, "Collection not empty");
        burn(_collectionId);
    }

    /// @inheritdoc ICollection
    function addProtectedDataToCollection(
        uint256 _collectionId,
        address _protectedData,
        address _appAddress
    ) public onlyCollectionOwner(_collectionId) {
        require(
            appRegistry.ownerOf(uint256(uint160(_appAddress))) == address(this),
            "App owner is not ProtectedDataSharing contract"
        );
        uint256 tokenId = uint256(uint160(_protectedData));
        require(
            protectedDataRegistry.getApproved(tokenId) == address(this),
            "ProtectedDataSharing Contract not approved"
        );
        appForProtectedData[_collectionId][_protectedData] = _appAddress;
        protectedDataRegistry.safeTransferFrom(msg.sender, address(this), tokenId);
        protectedDatas[_collectionId][uint160(_protectedData)] = _protectedData;
        protectedDataInCollection[_collectionId] += 1;
        emit ProtectedDataAddedToCollection(_collectionId, _protectedData, _appAddress);
    }

    /// @inheritdoc ICollection
    function removeProtectedDataFromCollection(
        uint256 _collectionId,
        address _protectedData
    ) public onlyCollectionOwner(_collectionId) onlyProtectedDataNotRented(_protectedData) {
        if (protectedDataInSubscription[_collectionId][_protectedData]) {
            require(
                lastSubscriptionExpiration[_collectionId] < block.timestamp,
                "Collection has ongoing subscriptions"
            );
        }
        require(
            protectedDatas[_collectionId][uint160(_protectedData)] != address(0),
            "ProtectedData not in collection"
        );
        protectedDataRegistry.safeTransferFrom(
            address(this),
            msg.sender,
            uint256(uint160(_protectedData))
        );
        delete protectedDatas[_collectionId][uint160(_protectedData)];
        delete appForProtectedData[_collectionId][_protectedData];
        protectedDataInCollection[_collectionId] -= 1;
        emit ProtectedDataRemovedFromCollection(_collectionId, _protectedData);
    }

    /***************************************************************************
     *                        Subscription                                     *
     ***************************************************************************/
    /// @inheritdoc ISubscription
    function subscribeTo(uint256 _collectionId) public payable returns (uint256) {
        require(subscriptionParams[_collectionId].duration > 0, "Subscription parameters not set");
        require(msg.value == subscriptionParams[_collectionId].price, "Wrong amount sent");
        uint48 endDate = uint48(block.timestamp) + subscriptionParams[_collectionId].duration;
        subscribers[_collectionId][msg.sender] = endDate;
        if (lastSubscriptionExpiration[_collectionId] < endDate) {
            lastSubscriptionExpiration[_collectionId] = endDate;
        }
        emit NewSubscription(_collectionId, msg.sender, endDate);
        return endDate;
    }

    /// @inheritdoc ISubscription
    function setProtectedDataToSubscription(
        uint256 _collectionId,
        address _protectedData
    )
        public
        onlyCollectionOwner(_collectionId)
        onlyProtectedDataInCollection(_collectionId, _protectedData)
        onlyProtectedDataNotForSale(_collectionId, _protectedData)
    {
        protectedDataInSubscription[_collectionId][_protectedData] = true;
        emit ProtectedDataAddedForSubscription(_collectionId, _protectedData);
    }

    /// @inheritdoc ISubscription
    function removeProtectedDataFromSubscription(
        uint256 _collectionId,
        address _protectedData
    )
        public
        onlyCollectionOwner(_collectionId)
        onlyProtectedDataInCollection(_collectionId, _protectedData)
        onlyCollectionNotSubscribed(_collectionId)
    {
        protectedDataInSubscription[_collectionId][_protectedData] = false;
        emit ProtectedDataRemovedFromSubscription(_collectionId, _protectedData);
    }

    /// @inheritdoc ISubscription
    function setSubscriptionParams(
        uint256 _collectionId,
        SubscriptionParams calldata _subscriptionParams
    ) public onlyCollectionOwner(_collectionId) {
        subscriptionParams[_collectionId] = _subscriptionParams;
        emit NewSubscriptionParams(_collectionId, _subscriptionParams);
    }

    /***************************************************************************
     *                        Rental                                           *
     ***************************************************************************/
    /// @inheritdoc IRental
    function rentProtectedData(uint256 _collectionId, address _protectedData) public payable {
        require(
            protectedDataForRenting[_collectionId][_protectedData].isForRent,
            "ProtectedData not available for renting"
        );
        require(
            protectedDataForRenting[_collectionId][_protectedData].price == msg.value,
            "Wrong amount sent"
        );
        uint48 endDate = uint48(block.timestamp) +
            protectedDataForRenting[_collectionId][_protectedData].duration;
        renters[_protectedData][msg.sender] = endDate;
        if (lastRentalExpiration[_protectedData] < endDate) {
            lastRentalExpiration[_protectedData] = endDate;
        }
        emit NewRental(_collectionId, _protectedData, msg.sender, endDate);
    }

    /// @inheritdoc IRental
    function setProtectedDataToRenting(
        uint256 _collectionId,
        address _protectedData,
        uint112 _price,
        uint48 _duration
    )
        public
        onlyCollectionOwner(_collectionId)
        onlyProtectedDataInCollection(_collectionId, _protectedData)
        onlyProtectedDataNotForSale(_collectionId, _protectedData)
    {
        require(_duration > 0, "Duration param invalide");
        protectedDataForRenting[_collectionId][_protectedData].isForRent = true;
        protectedDataForRenting[_collectionId][_protectedData].price = _price;
        protectedDataForRenting[_collectionId][_protectedData].duration = _duration;
        emit ProtectedDataAddedForRenting(_collectionId, _protectedData, _price, _duration);
    }

    /// @inheritdoc IRental
    function removeProtectedDataFromRenting(
        uint256 _collectionId,
        address _protectedData
    )
        public
        onlyCollectionOwner(_collectionId)
        onlyProtectedDataInCollection(_collectionId, _protectedData)
    {
        protectedDataForRenting[_collectionId][_protectedData].isForRent = false;
        emit ProtectedDataRemovedFromRenting(_collectionId, _protectedData);
    }

    /***************************************************************************
     *                        Sale                                             *
     ***************************************************************************/
    /// @inheritdoc ISale
    function setProtectedDataForSale(
        uint256 _collectionId,
        address _protectedData,
        uint112 _price
    )
        public
        onlyCollectionOwner(_collectionId)
        onlyProtectedDataInCollection(_collectionId, _protectedData)
        onlyProtectedDataNotAvailableInSubscription(_collectionId, _protectedData) // the data is not included in any subscription
        onlyProtectedDataNotForRenting(_collectionId, _protectedData) // no one can rent the data
        onlyProtectedDataNotRented(_protectedData) // wait for last rental expiration
    {
        protectedDataForSale[_collectionId][_protectedData].isForSale = true;
        protectedDataForSale[_collectionId][_protectedData].price = _price;
        emit ProtectedDataAddedForSale(_collectionId, _protectedData, _price);
    }

    /// @inheritdoc ISale
    function removeProtectedDataForSale(
        uint256 _collectionId,
        address _protectedData
    )
        public
        onlyCollectionOwner(_collectionId)
        onlyProtectedDataInCollection(_collectionId, _protectedData)
    {
        protectedDataForSale[_collectionId][_protectedData].isForSale = false;
        emit ProtectedDataRemovedFromSale(_collectionId, _protectedData);
    }

    /// @inheritdoc ISale
    function buyProtectedDataForCollection(
        uint256 _collectionIdFrom,
        address _protectedData,
        uint256 _collectionIdTo,
        address _appAddress
    ) public payable onlyCollectionOwner(_collectionIdTo) {
        require(
            protectedDataForSale[_collectionIdFrom][_protectedData].isForSale,
            "ProtectedData not for sale"
        );
        require(
            protectedDataForSale[_collectionIdFrom][_protectedData].price == msg.value,
            "Wrong amount sent"
        );
        delete appForProtectedData[_collectionIdFrom][_protectedData];
        appForProtectedData[_collectionIdTo][_protectedData] = _appAddress;
        _swapCollection(_collectionIdFrom, _collectionIdTo, _protectedData, _appAddress);
        delete protectedDataForSale[_collectionIdFrom][_protectedData];
        emit ProtectedDataSold(_collectionIdFrom, address(this), _protectedData);
    }

    /// @inheritdoc ISale
    function buyProtectedData(
        uint256 _collectionIdFrom,
        address _protectedData,
        address _to
    ) public payable {
        require(
            protectedDataForSale[_collectionIdFrom][_protectedData].isForSale,
            "ProtectedData not for sale"
        );
        require(
            protectedDataForSale[_collectionIdFrom][_protectedData].price == msg.value,
            "Wrong amount sent"
        );
        delete protectedDataForSale[_collectionIdFrom][_protectedData];
        _safeTransferFrom(_to, _protectedData);
        emit ProtectedDataSold(_collectionIdFrom, _to, _protectedData);
    }
}
