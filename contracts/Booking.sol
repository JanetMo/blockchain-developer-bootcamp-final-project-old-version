pragma solidity ^0.5.0;

contract Booking {
    
    address[16] public patients;

// Booking an appointment
    function book(uint appointmentId) public returns (uint) {
        require(appointmentId >= 0 && appointmentId <= 15);

        patients[appointmentId] = msg.sender;

        return appointmentId;
    }

  // Retrieving the appointment
    function getPatients() public view returns (address[16] memory) {
        return patients;
    }



}