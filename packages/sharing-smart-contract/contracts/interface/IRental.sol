// SPDX-License-Identifier: Apache-2.0

/******************************************************************************
 * Copyright 2024 IEXEC BLOCKCHAIN TECH                                       *
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

interface IRental {
    /**
     * Renting parameters for a protected data item.
     * @param isForRent - Indicates whether the protected data is available for renting.
     * @param price - The price in wei for renting the protected data.
     * @param duration - The duration in seconds for which the protected data can be rented.
     */
    struct RentingParams {
        bool isForRent;
        uint112 price; // 112 bit allows for 10^15 eth
        uint48 duration; // 48 bit allows 89194 years of delay
    }

    /**
     * Event emitted when protected data is added for renting in a collection.
     * @param collectionId - The ID of the collection.
     * @param protectedData - The address of the protected data.
     * @param price - The price in wei for renting the protected data.
     * @param duration - The duration in seconds for renting the protected data.
     */
    event ProtectedDataAddedForRenting(
        uint256 collectionId,
        address protectedData,
        uint112 price,
        uint48 duration
    );

    /**
     * Event emitted when protected data is removed from renting in a collection.
     * @param collectionId - The ID of the collection.
     * @param protectedData - The address of the protected data.
     */
    event ProtectedDataRemovedFromRenting(uint256 collectionId, address protectedData);

    /**
     * Event emitted when a new rental is created for protected data in a collection.
     * @param collectionId - The ID of the collection.
     * @param protectedData - The address of the protected data.
     * @param renter - The address of the renter.
     * @param endDate - The end date of the rental.
     */
    event NewRental(uint256 collectionId, address protectedData, address renter, uint48 endDate);

    /**
     * Rent protected data by paying the specified price.
     * @param _collectionId The ID of the collection containing the protected data.
     * @param _protectedData The address of the protected data to rent.
     */
    function rentProtectedData(uint256 _collectionId, address _protectedData) external payable;

    /**
     * Set protected data from a collection available for renting with the
     * specified price and duration.
     * @param _collectionId The ID of the collection.
     * @param _protectedData The address of the protected data to be added for renting.
     * @param _price The price for renting the protected data.
     * @param _duration The duration for which the protected data will be available for renting.
     */
    function setProtectedDataToRenting(
        uint256 _collectionId,
        address _protectedData,
        uint112 _price,
        uint48 _duration
    ) external;

    /**
     * Remove protected data from the available list of renting.
     * Cannot be rented anymore, ongoing rental are still valid
     * @param _collectionId The ID of the collection.
     * @param _protectedData The address of the protected data to be removed from renting.
     */
    function removeProtectedDataFromRenting(uint256 _collectionId, address _protectedData) external;
}