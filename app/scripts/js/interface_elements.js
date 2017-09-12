var months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
        
];

var thisYear = new Date().getFullYear();

function createNationalityOptions(){
        
        for(var i=0; i<nationalities.length; i++){
                var node = document.createElement("OPTION");                
                var textnode = document.createTextNode(nationalities[i]);         
                node.appendChild(textnode);                              
                document.getElementById("nationality").appendChild(node);
        }   
};

function createDays(){
        for(var i = 1; i<=31; i++){
                var node = document.createElement("OPTION");                
                var textnode = document.createTextNode(i);         
                node.appendChild(textnode);                              
                document.getElementsByName("day")[0].appendChild(node);
        }
}

function createMonths(){
        for(var i = 0; i<12; i++){
                var node = document.createElement("OPTION");                
                var textnode = document.createTextNode(months[i]);         
                node.appendChild(textnode);                              
                document.getElementsByName("month")[0].appendChild(node);
        }
}

function createYears(){
        for(var i = thisYear; i>= 1900; i--){
                var node = document.createElement("OPTION");                
                var textnode = document.createTextNode(i);         
                node.appendChild(textnode);                              
                document.getElementsByName("year")[0].appendChild(node);
        }
}



//call UI functions
createDays();
createMonths();
createYears();