App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load appointments.
    $.getJSON('../appointments.json', function(data) {
      var appointmentsRow = $('#appointmentsRow');
      var appointmentTemplate = $('appointmentTemplate');

      for (i = 0; i < data.length; i ++) {
        appointmentTemplate.find('.panel-title').text(data[i].name);
        appointmentTemplate.find('img').attr('src', data[i].picture);
        appointmentTemplate.find('.appointment-specialization').text(data[i].specialization);
        appointmentTemplate.find('.appointment-date').text(data[i].date);
        appointmentTemplate.find('.appointment-location').text(data[i].location);
        appointmentTemplate.find('.btn-book').attr('data-id', data[i].id);

        appointmentsRow.append(appointmentTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
        // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Booking.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var BookingArtifact = data;
      App.contracts.Booking = TruffleContract(BookingArtifact);
    
      // Set the provider for our contract
      App.contracts.Booking.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markBooked();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-book', App.handleBook);
  },

  markBooked: function() {
        var bookingInstance;

    App.contracts.Booking.deployed().then(function(instance) {
      bookingInstance = instance;

      return bookingInstance.getPatients.call();
    }).then(function(patients) {
      for (i = 0; i < patients.length; i++) {
        if (patients[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-appointment').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleBook: function(event) {
    event.preventDefault();

    var appointmentId = parseInt($(event.target).data('id'));

    var bookingInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Booking.deployed().then(function(instance) {
        bookingInstance = instance;

        // Execute adopt as a transaction by sending account
        return bookingInstance.book(appointmentId, {from: account});
      }).then(function(result) {npm
        return App.markBooked();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
