pragma solidity ^0.5.0;

contract CartoSign {
    struct Document {
        bytes32 name;
        bytes32 docFileName;
        address[] signeeAddresses;
        bytes32[] signedDocFileNames;
    }

    Document[] public documents;

    event SignedDocument(address signee, bytes32 signedDocUrl, string messsage);

    function sign(uint docIdx, uint signeeIdx, bytes32 signedDocFileName) public returns (uint) {
        address signeeAddresse = documents[docIdx].signeeAddresses[signeeIdx] ;
        bytes32[] storage signedDocFileNames = documents[docIdx].signedDocFileNames;
        require(msg.sender == signeeAddresse, "Invalid Signee Address");

        if(signedDocFileNames.length > 0) {
            require(signedDocFileNames[signeeIdx].length == 0, "Signeed");
            signedDocFileNames[signeeIdx] = signedDocFileName;
        }
        else {
            signedDocFileNames.push(signedDocFileName);
        }

        emit SignedDocument(msg.sender, signedDocFileName, "success");

        return docIdx;
    }

    function getTotalDoc() public view returns (uint) {
        return documents.length;
    }

    function getSigneeDoc(uint docId, uint signeeId) public view returns (address) {
        return documents[docId].signeeAddresses[signeeId];
    }

    function getSigneeDocFileName(uint docId, uint signeeId) public view returns (bytes32) {
        return documents[docId].signedDocFileNames[signeeId];
    }

    function getDocName(uint docId) public view returns (bytes32) {
        return documents[docId].name;
    }

    function addDocument(bytes32 name, bytes32 docFileUrl, address[] memory signeeAddresses, bytes32[] memory signedDocUrls) public returns (uint) {
        documents.push(Document(name, docFileUrl, signeeAddresses, signedDocUrls));
        return documents.length;
    }

    function addSigneeToDoc(uint docIdx, address signeeAddress) public returns (address) {
        documents[docIdx].signeeAddresses.push(signeeAddress) ;
        return signeeAddress;
    }

}
