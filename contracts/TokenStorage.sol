// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenStorage {
    mapping(string => uint256) private tokens;

    function addToken(string memory name, uint256 token) public {
        tokens[name] = token;
    }

    function getToken(string memory name) public view returns (uint256) {
        return tokens[name];
    }
}