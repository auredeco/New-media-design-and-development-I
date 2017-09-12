/*
 *	Description: Equatr
 *	Modified: 10-11-2015
 *	Version: 1.0.0
 *	Author: Glenn De Kerpel, Aurelio Decock, (Annelien Haegebaert)
 * 	-----------------------------------------------
 */

// Anonymous function executed when document loaded
(function() {

    // Describe an App object with own functionalities
    var App = {
        init: function() {
			var self = this;
            this._user = user; // create a clone from the user object
            this._user.init('dds.Equatr');
            this.registerNavigationToggleListeners();// Register All Navigation Toggle Listeners
			this.registerWindowListeners();// Register All Navigation Toggle Listeners
			
			//API DATASETS
            this.WBCOUNTRIESAPIURL = "http://api.worldbank.org/countries/all?format=jsonP&per_page=300&prefix=jsonp_callback";
			this.WBFORRESTAREAPERCOUNTRYAPI = "http://api.worldbank.org/countries/{0}/indicators/AG.LND.FRST.ZS?format=jsonP&per_page=300&MRV=5&prefix=jsonp_callback";
			this.UNEMPLOYMENT = "http://api.worldbank.org/countries/{0}/indicators/SL.UEM.TOTL.ZS?format=jsonP&per_page=300&MRV=5&prefix=jsonp_callback";
			this.BIRTHSPERWOMAN = "http://api.worldbank.org/countries/{0}/indicators/SP.DYN.TFRT.IN?format=jsonP&per_page=1300&MRV=5&prefix=jsonp_callback"
            this.POPULATION = "http://api.worldbank.org/countries/{0}/indicators/SP.POP.GROW?format=jsonP&per_page=300&MRV=5&prefix=jsonp_callback"
            this.DEATHRATE = "http://api.worldbank.org/countries/{0}/indicators/SP.DYN.CBRT.IN?format=jsonP&per_page=300&MRV=5&prefix=jsonp_callback"
			
			this._dataCountries = null;// Variable for the list of countries
			this._dataCountry = {
				"info": null,// Information of the country comes from the list of countries
				"forrestArea": null,// Variable for the list of forrestArea per year
				"unemployment": null, // Variable for the list of cellular subscriptions per year
				"births": null,
                "population": null,
                "deathRate": null
			}// Variable for the details of a country
            
			// Handlebars Cache
			this._hbsCache = {};// Handlebars cache for templates
			this._hbsPartialsCache = {};// Handlebars cache for partials
			this._jayWalker = JayWalker;// Create a clone from the JayWalker object
			this._jayWalker.init(); // initialize the jaywalker
			this._jayWalker._countryDetailsJSONPLoaded.add(function(iso2code) {
				self.loadDatasetsFromCountry(iso2code);// Test: load details data from country
			});
			this.loadCountriesFromWorldBankAPI();// Execute method loadCountriesFromWorldBankAPI(): Load countries from the Worldbank API
			this.checkFormValidation();
        },
        
        loadCountriesFromWorldBankAPI: function() {
			// Closure
			var self = this, url = String.format(this.WBCOUNTRIESAPIURL);
			
			// Load JSONP from corresponding API with certain URL
			// JSONP Callback is defined by a function name in this case
			// prefix=jsonp_callback. The Utils object contains a new function
			// which can handle the callback
			Utils.getJSONPByPromise(url).then(
				function(data) {
					if(data != null) {
						var countries = data[1]; // Get the countries from JSON (second item from array, first item is paging)
						var countriesFiltered = _.filter(countries, function(country) {
							return !(/\d/.test(country.iso2Code));
						});// First remove weird countries with LoDash + Assign data as value flor global variable _dataCountries within the App
						var badISO2Codes = ['XT', 'XN', 'ZG', 'ZF', 'OE', 'XS', 'XR', 'XU', 'XQ', 'XP', 'ZQ', 'XO', 'XN', 'XM', 'XL', 'ZJ', 'XJ', 'XY', 'XE', 'EU', 'XC', 'JG', 'XD'];
						self._dataCountries = _.filter(countriesFiltered, function(country) {
							var validCountry = true, i = 0;
							
							while(validCountry && i < badISO2Codes.length) {
								if(country.iso2Code == badISO2Codes[i]) {
									validCountry = false;
								} else {
									i++;
								}
							}			
							return validCountry;
						});// Filter (weird codes: XT, XN, ZG, ZF, OE, XS, XR, XU, XQ, XP, ZQ, XO, XN, XM, XL, ZJ, XJ, XY, XE, EU, XC, JG)
						self._dataCountries = _.sortBy(self._dataCountries, function(country) {
							return country.name;
						});// Sorting on country name
						self.updateCountriesUI('countries-list', '#countries-list-template');// Call updateCountriesUI method when successful*/
					}
					var country = null;
					for(var i =0; i<countries.length; i++){
						country = countries[i].name;
						var node = document.createElement("OPTION");                
						var textnode = document.createTextNode(country);         
						node.appendChild(textnode);                              
						document.getElementById("nationality").appendChild(node);
					}
				},
				function(status) {
					console.log(status);
				}
			);
		},
		//Load countries into the handlebars template
		updateCountriesUI: function(hbsTmplName, hbsTmplId) {
			if(!this._hbsCache[hbsTmplName]) {
				var src = document.querySelector(hbsTmplId).innerHTML;// Get the contents from the specified hbs template and store it into a variable
				this._hbsCache[hbsTmplName] = Handlebars.compile(src);// Compile the source and add it to the hbs cache
			}	
			document.querySelector('.countries-list').innerHTML = this._hbsCache[hbsTmplName](this._dataCountries);// Write compiled content to the appropriate container
		},
		
		loadDatasetsFromCountry: function(iso2code) {
			var selectedCountry = _.find(this._dataCountries, function(country) {
				return country.iso2Code == iso2code;
			});
			if(selectedCountry != null && typeof selectedCountry != undefined) {
				this._dataCountry.info = selectedCountry;
			}
			this.loadForrestAreaFromCountryFromWorldBankAPI(iso2code);// Load forrest area dataset
			this.loadUnemploymentsFromCountryFromWorldBankAPI(iso2code);// Load cellular usage dataset
			this.loadBirthsPerWomanFromCountry(iso2code);
            this.loadPopulationFromCountryFromWorldBankAPI(iso2code);
            this.loadDeathRateFromCountryFromWorldBankAPI(iso2code);
		},
		loadForrestAreaFromCountryFromWorldBankAPI: function(iso2code) {
			// Closure
			// UPDATE
			var self = this, url = String.format(this.WBFORRESTAREAPERCOUNTRYAPI, iso2code);
			
			// Load JSONP from corresponding API with certain URL
			// JSONP Callback is defined by a function name in this case
			// prefix=jsonp_callback. The Utils object contains a new function
			// which can handle the callback
			Utils.getJSONPByPromise(url).then(
				function(data) {
					if(data != null) {
						var forrestArea = data[1]; // Get the forrest area from the selected country from JSON (second item from array, first item is paging)
						var forrestAreaFiltered = _.filter(forrestArea, function(forrestAreaPerYear) {
							return forrestAreaPerYear.value != null;
						});// First remove all years where value is null with LoDash
						forrestAreaFiltered = _.sortBy(forrestAreaFiltered, function(forrestAreaPerYear) {
							return forrestAreaPerYear.year;
						});// Sorting on year
						self._dataCountry.forrestArea = forrestAreaFiltered;// Add the forrest area data to the details of a country
						self.updateCountryDetailsUI('country-details', '#country-details-template');// Call updateCountryDetailsUI method when successful
					}	
				},
				function(status) {
					console.log(status);
				}
			);
		},
        loadDeathRateFromCountryFromWorldBankAPI: function(iso2code) {
			// Closure
			// UPDATE
			var self = this, url = String.format(this.DEATHRATE, iso2code);
			
			// Load JSONP from corresponding API with certain URL
			// JSONP Callback is defined by a function name in this case
			// prefix=jsonp_callback. The Utils object contains a new function
			// which can handle the callback
			Utils.getJSONPByPromise(url).then(
				function(data) {
					if(data != null) {
						var deathRate = data[1]; // Get the forrest area from the selected country from JSON (second item from array, first item is paging)
						var deathRateFiltered = _.filter(deathRate, function(deathRatePerYear) {
							return deathRatePerYear.value != null;
						});// First remove all years where value is null with LoDash
						deathRateFiltered = _.sortBy(deathRateFiltered, function(deathRatePerYear) {
							return deathRatePerYear.year;
						});// Sorting on year
						self._dataCountry.deathRate = deathRateFiltered;// Add the forrest area data to the details of a country
						self.updateCountryDetailsUI('country-details', '#country-details-template');// Call updateCountryDetailsUI method when successful
					}	
				},
				function(status) {
					console.log(status);
				}
			);
		},
        loadPopulationFromCountryFromWorldBankAPI: function(iso2code) {
			// Closure
			// UPDATE
			var self = this, url = String.format(this.POPULATION, iso2code);
			
			// Load JSONP from corresponding API with certain URL
			// JSONP Callback is defined by a function name in this case
			// prefix=jsonp_callback. The Utils object contains a new function
			// which can handle the callback
			Utils.getJSONPByPromise(url).then(
				function(data) {
					if(data != null) {
						var population = data[1]; // Get the forrest area from the selected country from JSON (second item from array, first item is paging)
						var populationFiltered = _.filter(population, function(populationPerYear) {
							return populationPerYear.value != null;
						});// First remove all years where value is null with LoDash
						populationFiltered = _.sortBy(populationFiltered, function(populationPerYear) {
							return populationPerYear.year;
						});// Sorting on year
						self._dataCountry.population = populationFiltered;// Add the forrest area data to the details of a country
						self.updateCountryDetailsUI('country-details', '#country-details-template');// Call updateCountryDetailsUI method when successful
					}	
				},
				function(status) {
					console.log(status);
				}
			);
		},
		loadBirthsPerWomanFromCountry: function(iso2code) {
			// Closure
			// UPDATE
			var self = this, url = String.format(this.BIRTHSPERWOMAN, iso2code);
			
			// Load JSONP from corresponding API with certain URL
			// JSONP Callback is defined by a function name in this case
			// prefix=jsonp_callback. The Utils object contains a new function
			// which can handle the callback
			Utils.getJSONPByPromise(url).then(
				function(data) {
					if(data != null) {
						var births = data[1]; // Get the forrest area from the selected country from JSON (second item from array, first item is paging)
						var birthsFiltered = _.filter(births, function(birthsPerYear) {
							return birthsPerYear.value != null;
						});// First remove all years where value is null with LoDash
						birthsFiltered = _.sortBy(birthsFiltered, function(birthsPerYear) {
							return birthsPerYear.year;
						});// Sorting on year
						self._dataCountry.births = birthsFiltered;// Add the forrest area data to the details of a country
						self.updateCountryDetailsUI('country-details', '#country-details-template');// Call updateCountryDetailsUI method when successful
					}	
				},
				function(status) {
					console.log(status);
				}
			);
		},
		loadUnemploymentsFromCountryFromWorldBankAPI: function(iso2code) {
			// Closure
			// UPDATE
			var self = this, url = String.format(this.UNEMPLOYMENT, iso2code);
			
			// Load JSONP from corresponding API with certain URL
			// JSONP Callback is defined by a function name in this case
			// prefix=jsonp_callback. The Utils object contains a new function
			// which can handle the callback
			Utils.getJSONPByPromise(url).then(
				function(data) {
					if(data != null) {
						var unemployment = data[1]; // Get the cellular subscriptions from the selected country from JSON (second item from array, first item is paging)
						var unemploymentFiltered = _.filter(unemployment, function(unem) {
							return unem.value != null;
						});// First remove all years where value is null with LoDash
						unemploymentFiltered = _.sortBy(unemploymentFiltered, function(unem) {
							return unem.year;
						});// Sorting on year
						self._dataCountry.unemployment = unemploymentFiltered;// Add the cellular subscriptions data to the details of a country
						self.updateCountryDetailsUI('country-details', '#country-details-template');// Call updateCountryDetailsUI method when successful
					}	
				},
				function(status) {
					console.log(status);
				}
			);
		},
		updateCountryDetailsUI: function(hbsTmplName, hbsTmplId) {
			if(!this._hbsCache[hbsTmplName]) {
				var src = document.querySelector(hbsTmplId).innerHTML;// Get the contents from the specified hbs template
				this._hbsCache[hbsTmplName] = Handlebars.compile(src);// Compile the source and add it to the hbs cache
			}	
			document.querySelector('.country-details').innerHTML = this._hbsCache[hbsTmplName](this._dataCountry);// Write compiled content to the appropriate container
			this.createForrestAreaGraphForCountry();
			this.createUnemploymentGraphForCountry();
            this.createBirthGraphForCountry();
            this.createPopulationGraphForCountry();
            this.createDeathRateForCountry();
            this.createBookmarksHandlerForUser();
		},
		createForrestAreaGraphForCountry: function() {
			if(this._dataCountry.forrestArea != null) {
				var labels = [], series = [];
				_.each(this._dataCountry.forrestArea.reverse(), function(item) {
					labels.push(item.date);
					series.push(parseFloat(item.value));
				});
	
				var options = {
					low: _.min(_.pluck(this._dataCountry.forrestArea, 'value')),
					hight: _.max(_.pluck(this._dataCountry.forrestArea, 'value'))
				};
				
				var data = {
					labels: labels,
					series: [series]
				};
				// Create a new line chart object where as first parameter we pass in a selector that is resolving to our chart container element. The Second parameter is the actual data object.
				new Chartist.Line('.country-details-forrestarea-chart', data, options);	
			}
		},
		createUnemploymentGraphForCountry: function() {
			if(this._dataCountry.unemployment != null) {
				var labels = [], series = [];
				_.each(this._dataCountry.unemployment.reverse(), function(item) {
					labels.push(item.date);
					series.push(parseFloat(item.value));
				});
	
				var options = {
					low: _.min(_.pluck(this._dataCountry.unemployment, 'value')),
					hight: _.max(_.pluck(this._dataCountry.unemployment, 'value'))
				};
				
				var data = {
					labels: labels,
					series: [series]
				};
				// Create a new line chart object where as first parameter we pass in a selector that is resolving to our chart container element. The Second parameter is the actual data object.
				new Chartist.Line('.country-details-unemployment-chart', data, options);		
			}
		},
        createBirthGraphForCountry: function() {
			if(this._dataCountry.births != null) {
				var labels = [], series = [];
				_.each(this._dataCountry.births.reverse(), function(item) {
					labels.push(item.date);
					series.push(parseFloat(item.value));
				});
	
				var options = {
					low: _.min(_.pluck(this._dataCountry.births, 'value')),
					hight: _.max(_.pluck(this._dataCountry.births, 'value'))
				};
				
				var data = {
					labels: labels,
					series: [series]
				};
				// Create a new line chart object where as first parameter we pass in a selector that is resolving to our chart container element. The Second parameter is the actual data object.
				new Chartist.Line('.country-details-birthsPerWoman-chart', data, options);		
			}
		},
        createPopulationGraphForCountry: function() {
			if(this._dataCountry.population != null) {
				var labels = [], series = [];
				_.each(this._dataCountry.population.reverse(), function(item) {
					labels.push(item.date);
					series.push(parseFloat(item.value));
				});
	
				var options = {
					low: _.min(_.pluck(this._dataCountry.population, 'value')),
					hight: _.max(_.pluck(this._dataCountry.population, 'value'))
				};
				
				var data = {
					labels: labels,
					series: [series]
				};
				// Create a new line chart object where as first parameter we pass in a selector that is resolving to our chart container element. The Second parameter is the actual data object.
				new Chartist.Line('.country-details-population-chart', data, options);		
			}
		},
        createDeathRateForCountry: function() {
			if(this._dataCountry.deathRate != null) {
				var labels = [], series = [];
				_.each(this._dataCountry.deathRate.reverse(), function(item) {
					labels.push(item.date);
					series.push(parseFloat(item.value));
				});
	
				var options = {
					low: _.min(_.pluck(this._dataCountry.deathRate, 'value')),
					hight: _.max(_.pluck(this._dataCountry.deathRate, 'value'))
				};
				
				var data = {
					labels: labels,
					series: [series]
				};
				// Create a new line chart object where as first parameter we pass in a selector that is resolving to our chart container element. The Second parameter is the actual data object.
				new Chartist.Line('.country-details-deathRate-chart', data, options);		
			}
		},
		
		//Form-validator
		checkFormValidation: function(){
			var form = document.querySelector("#registerForm"); //store form into local variable
			//If clicked on the registerButton
			document.querySelector("#btn_register").addEventListener("click", function(e){
				// Launch the form validator
				//if the validator returns false
				if(Utils.formValidation(form) == false){
					e.preventDefault();//prevent the app from going further
				} else {
					user.registerNewUser(); //otherwise register the new user
				};
			});
		},
		
		//Navigation functions
		registerNavigationToggleListeners: function() {
			var toggles = document.querySelectorAll('.navigation-toggle');
			
			if(toggles != null && toggles.length > 0) {
				var toggle = null;
				
				for(var i = 0; i < toggles.length; i++ ) {
					toggle = toggles[i];
                   

					toggle.addEventListener('click', function(ev) {
						ev.preventDefault();
						
						document.querySelector('body').classList.toggle(this.dataset.navtype);

					});	
				}
			}
		},
		registerWindowListeners: function() {
            window.addEventListener('resize', function (ev) {
                if (document.querySelector('body').classList.contains('offcanvas-open')) {
                    document.querySelector('body').classList.remove('offcanvas-open');
                }

                if (document.querySelector('body').classList.contains('headernav-open')) {
                    document.querySelector('body').classList.remove('headernav-open');
                }
            });
        },
            
        createBookmarksHandlerForUser: function(){
            var bookmark = document.querySelector(".bookmark-icon");
            bookmark.addEventListener("click", function(e){
                e.preventDefault();
                var bookmarkURL = window.location.href;
                var userBookmarks = App._user._user.bookmarks;
                for(var i = 0; i <= userBookmarks.length; i++){
                    if(userBookmarks[i] == bookmarkURL){
                        break;
                    }else {
                        App._user._user.bookmarks.push(bookmarkURL);
                        break;
                    }
                    App._user.save();
                } 
            })
            this.updateBookmarkUI();
        },
        updateBookmarkUI: function(){
           var bookmarksList = document.querySelector("#bookmarks-list");
           var userBookmarks = App._user._user.bookmarks;
           console.log(userBookmarks.length);
           for(var i = 0; i <= userBookmarks.length; i++){
               var node = document.createElement("li");
               var linkNode = document.createElement("a");  
               var stringCreateBookmark = String(userBookmarks[i]);              
		       var textnode = document.createTextNode(stringCreateBookmark.substr(stringCreateBookmark.length-2, stringCreateBookmark.length));         
		       linkNode.appendChild(textnode); 
               node.appendChild(linkNode);
               bookmarksList.appendChild(node);
           }                                 
        },
    }

    App.init();// Intialize the application

})();