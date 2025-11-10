pragma solidity ^0.8.19; // <-- Updated pragma

contract ElectionFact {
    
    struct ElectionDet {
        address deployedAddress;
        string el_n;
        string el_d;
    }
    
    mapping(string => ElectionDet) public companyEmail; // <-- Made public for easier access

    function createElection(
        string memory email,
        string memory election_name,
        string memory election_description
    ) public {
        address newElection = address(new Election(msg.sender, election_name, election_description)); // <-- Explicitly cast to address
        companyEmail[email].deployedAddress = newElection;
        companyEmail[email].el_n = election_name;
        companyEmail[email].el_d = election_description;
    }
    
    function getDeployedElection(string memory email) 
        public 
        view 
        returns (address, string memory, string memory) // <-- Added 'memory'
    {
        address val = companyEmail[email].deployedAddress;
        if (val == address(0)) // <-- Check against address(0)
            return (address(0), "", "Create an election.");
        else
            return (
                companyEmail[email].deployedAddress,
                companyEmail[email].el_n,
                companyEmail[email].el_d
            );
    }
}

contract Election {
    //election_authority's address
    address public election_authority; // <-- Made public
    string public election_name; // <-- Made public
    string public election_description; // <-- Made public
    bool public status; // <-- Made public

    //election_authority's address taken when it deploys the contract
    constructor(
        address authority,
        string memory name, // <-- Added 'memory'
        string memory description // <-- Added 'memory'
    ) { // <-- Removed 'public'
        election_authority = authority;
        election_name = name;
        election_description = description;
        status = true;
    }

    //Only election_authority can call this function
    modifier owner() {
        require(msg.sender == election_authority, "Error: Access Denied.");
        _;
    }
    //candidate election_description

    struct Candidate {
        string candidate_name;
        string candidate_description;
        string imgHash;
        uint256 voteCount; // <-- Changed to uint256 for safety
        string email;
    }

    //candidate mapping
    mapping(uint256 => Candidate) public candidates; // <-- Changed to uint256

    //voter election_description
    struct Voter {
        uint256 candidate_id_voted; // <-- Changed to uint256
        bool voted;
    }

    //voter mapping
    mapping(string => Voter) public voters; // <-- Made public
    
    //counter of number of candidates
    uint256 public numCandidates; // <-- Changed to uint256

    //counter of number of voters
    uint256 public numVoters; // <-- Changed to uint256

    //function to add candidate to mapping
    function addCandidate(
        string memory candidate_name,
        string memory candidate_description,
        string memory imgHash,
        string memory email
    ) public owner {
        uint256 candidateID = numCandidates++; // <-- uses uint256
        //assign id of the candidate
        candidates[candidateID] = Candidate(
            candidate_name,
            candidate_description,
            imgHash,
            0,
            email
        );
        //add the values to the mapping
    }

    //function to vote and check for double voting
    function vote(uint256 candidateID, string memory e) public { // <-- Added 'memory', changed to uint256
        //if false the vote will be registered
        require(!voters[e].voted, "Error:You cannot double vote");
        voters[e] = Voter(candidateID, true); //add the values to the mapping
        numVoters++;
        candidates[candidateID].voteCount++; // <-- Overflow is auto-checked in 0.8+
        //increment vote counter of candidate
    }

    //function to get count of candidates
    function getNumOfCandidates() public view returns (uint256) { // <-- Changed to uint256
        return numCandidates;
    }

    //function to get count of voters
    function getNumOfVoters() public view returns (uint256) { // <-- Changed to uint256
        return numVoters;
    }

    //function to get candidate information
    function getCandidate(uint256 candidateID) // <-- Changed to uint256
        public
        view
        returns (string memory, string memory, string memory, uint256, string memory) // <-- Changed to uint256
    {
        return (
            candidates[candidateID].candidate_name,
            candidates[candidateID].candidate_description,
            candidates[candidateID].imgHash,
            candidates[candidateID].voteCount,
            candidates[candidateID].email
        );
    }

    //function to return winner candidate information
    function winnerCandidate() public view owner returns (uint256) { // <-- Changed to uint256
        uint256 largestVotes = candidates[0].voteCount; // <-- Changed to uint256
        uint256 candidateID = 0; // <-- Changed to uint256 and initialized
        for (uint256 i = 1; i < numCandidates; i++) { // <-- Changed to uint256
            if (largestVotes < candidates[i].voteCount) {
                largestVotes = candidates[i].voteCount;
                candidateID = i;
            }
        }
        return (candidateID);
    }

    function getElectionDetails() public view returns (string memory, string memory) { // <-- Added 'memory'
        return (election_name, election_description);
    }
}