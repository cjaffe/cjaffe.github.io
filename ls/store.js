var width = 430,
    height = 550;

var width2 = 315,
	height2 = 450;

var svg = d3.select( "#store" )
  .append( "svg" )
  .attr( "width", width )
  .attr( "height", height )
  .attr( "id", "store_svg");

var cart_svg = d3.select("#cart-items")
	.append("svg")
	.attr("width", width2)
	.attr("height", height2)
	.attr("id", "cart_svg");

 var g = svg.append( "g" );
 var g2 = cart_svg.append("g");
 var g3 = cart_svg.append("g");


 var categories = ["Beverages", "Dairy", "Deli", "Grocery", "Home", "Produce"];
 var x_helper = 0;
 var prev_cat = "Beverages";

 var geuParams = ["1 hour of childcare is worth ", "1 hour of lending a power tool is worth ", "1 homecooked meal is worth "];
 var ccuParams = ["1 polluted acre of Middlesex Fells is worth ", "1 polluted acre of Blue Hills Reservation is worth ", "1 polluted gallon of the Charles River is worth "];
 var cart = [];
 var store_items = [];

 var displayedCurr = "";
 getDisplayedCurr();

 function getDisplayedCurr() {
 	 displayedCurr = $("#dropdownMenu1:first-child")[0].innerText.trim();
 }

 /* Initialize tooltip */
var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
  //console.log(d);
  return "<h5>" + d.name + "</h5><p>USD: $" + d.usd + 
  	"</p><p>GEU: " + d.geu.toFixed(2) + "</p><p>CCU: " + d.ccu.toFixed(2) + 
  	"</p><button class='cart_button' onclick='addToCart(\"" + d.id + "\")'>Add to Cart</button>";
});

/* Invoke the tip in the context of your visualization */
g.call(tip);

  // ID of the Google Spreadsheet
 var spreadsheetID = "1AYK87jVv3x-yfQfPzsMKWjJDDqgy7mDQ29Q7rQkLAZg";
 
 // Make sure it is public or set to Anyone with link can view 
 var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";
 
 $.getJSON(url, function(data) {
 	
 	//get and clean items
 	store_items = data.feed.entry;

 	store_items.map(function(items) {
 		items.name = items.gsx$name.$t;
 		items.id = items.gsx$id.$t;
 		items.usd = parseFloat(items.gsx$usd.$t);
 		items.category = items.gsx$category.$t;
 	});

 	calculateGEU();
 	calculateCCU();

 	g.selectAll("text")
 		.data(categories)
 		.enter()
 		.append("text")
 		.attr("x", 32)
 		.attr("y", function(d, i) {
 			return 50 + i*85; 
 		})
 		.text( function(d) { return d; })
 		.attr("font-size", "28px");

 	updateGrocery();
 });

function updateGrocery() {
 	g.selectAll("circle")
  	.data(store_items)
  	.enter()
  	.append("circle")
  	.attr("cx", function(d, i) {
  		if (d.category != prev_cat) {
  			x_helper = i;
  			prev_cat = d.category;
  		}
  		return (i-x_helper)*46 + 50;
  	})
  	.attr("cy", function(d) {
  		var i = categories.indexOf(d.category);
  		return 80 + i*85;
  	})
  	.attr("r", "18")
  	.attr("fill", function(d) {
  		if (d.usd < 3) { return "#fb6a4a"; }
  		else if (d.usd < 7) { return "#ef3b2c"; }
  		else { return "#a50f15"; }
  	})
  	.on('click', function(d) {
  		if (!d.tooltip) { 
  			tip.show(d);
  			d.tooltip = true; 
  		} 
  		else { 
  			tip.hide(d); 
  			d.tooltip = false;
  		}
  	});
}

function addToCart(item) {
	if (cart.length > 0) {
		cart.pop();
		cart.pop();
	}
	var added_item = store_items.filter(function(d) {
		return d.id === item;
	})[0];
	cart.push(added_item);
	var total = getCartTotal();
	cart.push({"name": "", "value": ""});
	cart.push({"name": "TOTAL:", "value": total});
	updateCart();
}

function getCartTotal() {
	if (displayedCurr === "USD") {
		return cart.reduce(function(result, arr) {
			if (arr.name !== "TOTAL:" && arr.name !== "") {
				return result += parseFloat(arr.usd);
			} else { return result; }
		}, 0);
	} else if (displayedCurr === "GEU") {
		return cart.reduce(function(result, arr) {
			if (arr.name !== "TOTAL:" && arr.name !== "") {
				return result += parseFloat(arr.geu);
			} else { return result; }
		}, 0);
	} else if (displayedCurr === "CCU") {
		return cart.reduce(function(result, arr) {
			if (arr.name !== "TOTAL:" && arr.name !== "") {
				return result += parseFloat(arr.ccu);
			} else { return result; }
		}, 0);
	}
}

$(function(){

    $(".dropdown-menu li a").click(function(){

      $("#dropdownMenu1:first-child").html($(this).text() + " <span class='caret'></span>");
      $("#dropdownMenu1:first-child").val($(this).text());
      getDisplayedCurr();
      if (cart.length > 0) {
		updateCartCurr();
	  }

   });

});

function calculateGEU() {
	var multiplier = parseInt($("#geu-slider")[0].value);
	store_items.map(function(d) {
		d.geu = d.usd * multiplier;
	});
}

function calculateCCU() {
	var multiplier = parseInt($("#ccu-slider")[0].value);
	store_items.map(function(d) {
		d.ccu = d.usd * multiplier;
	});
}

function updateGEU(val) {
	document.getElementById("geu").innerHTML = "1 USD is worth " + val + " GEU";
	calculateGEU();
	updateGrocery();
	if (cart.length > 0) {
		updateCartCurr();
	}
}

function updateGEUVal(e, val) {
	var ind = e.id[4];
	var id = "geu" + ind;
	var str = geuParams[ind-1];
	document.getElementById(id).innerHTML = str + val + " GEU";
}

function updateCCU(val) {
	document.getElementById("ccu").innerHTML = "1 USD is worth " + val + " CCU";
	calculateCCU();
	updateGrocery();
	if (cart.length > 0) {
		updateCartCurr();
	}
}

function updateCCUVal(e, val) {
	var ind = e.id[4];
	var id = "ccu" + ind;
	var str = ccuParams[ind-1];
	document.getElementById(id).innerHTML = str + val + " CCU";
}

function clearCart() {
	console.log('here');
	g2.selectAll("text")
	.remove();
	g3.selectAll("text")
	.remove();
	cart = [];

}

function updateCart() {
	g2.selectAll("text")
	.remove();
	g3.selectAll("text")
	.remove();
	g2.selectAll("text")
		.data(cart)
		.enter()
		.append("text")
		.attr("x", 10)
		.attr("y", function(d, i) {
			return i*20 + 16;
		})
		.attr("font-size", "16px")
		.attr("fill", "black")
		.text( function(d) { 
			return d.name;
		});
	g3.selectAll("text")
		.data(cart)
		.enter()
		.append("text")
		.attr("x", 250)
		.attr("y", function(d, i) {
			return i*20 + 16;
		})
		.attr("font-size", "16px")
		.attr("fill", "black")
		.text( function(d) { 
			if (d.name === "TOTAL:") { return d.value.toFixed(2); }
			else if (d.name === "" ) { return ""; }
			else if (displayedCurr === "USD") { return d.usd; }
			else if (displayedCurr === "GEU") { return d.geu.toFixed(2); }
			else if (displayedCurr === "CCU") { return d.ccu.toFixed(2); }
		});
}

function updateCartCurr() {
	var cartTotal = getCartTotal();
	cart[cart.length-1].value = cartTotal;
	g3.selectAll("text")
	.remove();
	g3.selectAll("text")
		.data(cart)
		.enter()
		.append("text")
		.attr("x", 250)
		.attr("y", function(d, i) {
			return i*20 + 16;
		})
		.attr("font-size", "16px")
		.attr("fill", "black")
		.text( function(d) { 
			if (d.name === "TOTAL:") { return d.value.toFixed(2); }
			else if (d.name === "" ) { return ""; }
			else if (displayedCurr === "USD") { return d.usd.toFixed(2); }
			else if (displayedCurr === "GEU") { return d.geu.toFixed(2); }
			else if (displayedCurr === "CCU") { return d.ccu.toFixed(2); }
		});

}

$('#exampleModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var recipient = button.data('whatever'); // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  var total = getCartTotal();
  console.log(total);
  var currency = "The currency you have selected is " + displayedCurr + " and the total cart cost is " + total.toFixed(2) + ".";
  if (total === 0) { 
  	currency = currency + " Add items to your cart to learn more about the different currencies.";
  	modal.find('#currency-explainers').show();

  }
  modal.find('#currency').text(currency);
  if (displayedCurr === "USD" && total !== 0) {
  	modal.find('#lead-text').text("To explore new currencies, change the displayed currency to GEU or CCU.");
  	modal.find('#currency-explainers').hide();

  } else if (displayedCurr === "GEU" && total !== 0) {
  	var curr1 = document.getElementById("geu-1-slider").value;
  	var curr2 = document.getElementById("geu-2-slider").value;
  	var curr3 = document.getElementById("geu-3-slider").value;
  	var geuPerUSD = document.getElementById("geu-slider").value;
  	var curr4 = curr1/geuPerUSD;
  	var curr5 = curr2/geuPerUSD;
  	var curr6 = curr3/geuPerUSD;

  	//redefine currs 1-3
  	curr1 = total/curr1;
  	curr2 = total/curr2;
  	curr3 = total/curr3;
  	modal.find('#lead-text').text("Based on the currency parameters you've set, you can pay your grocery bill with:");
  	modal.find('#curr1').text(curr1.toFixed(2) + " hours of childcare");
  	modal.find('#curr2').text(curr2.toFixed(2) + " hours of lending a power tool");
  	modal.find('#curr3').text(curr3.toFixed(2) + " homecooked meals");
  	modal.find('.or').toggle();

	modal.find('#lead-text2').text("In other words, based on the currency parameters you've set:");
  	modal.find('#curr4').text("1 hour of childcare is worth " + curr4 + " USD"); 
  	modal.find('#curr5').text("1 hour of lending a power tool is worth " + curr5 + " USD");
  	modal.find('#curr6').text("1 homecooked meal is worth " + curr6 + " USD");

  	modal.find('#extra-text').hide();
  	modal.find('#currency-explainers').show();

  } else if (displayedCurr === "CCU" && total !== 0) {

  	var curr1 = document.getElementById("ccu-1-slider").value;
  	var curr2 = document.getElementById("ccu-2-slider").value;
  	var curr3 = document.getElementById("ccu-3-slider").value;
	var ccuPerUSD = document.getElementById("ccu-slider").value;
  	var curr4 = curr1/ccuPerUSD;
  	var curr5 = curr2/ccuPerUSD;
  	var curr6 = curr3/ccuPerUSD;

  	//redefine currs 1-3
  	curr1 = total/curr1;
  	curr2 = total/curr2;
  	curr3 = total/curr3;
  	modal.find('#lead-text').text("Based on the currency parameters you've set, you can pay your grocery bill with the right to pollute*:");
  	modal.find('#curr1').text(curr1.toFixed(2) + " acres of Middlesex Fells");
  	modal.find('#curr2').text(curr2.toFixed(2) + " acres of Blue Hills Reservation");
  	modal.find('#curr3').text(curr3.toFixed(2) + " gallons of the Charles River");
  	modal.find('.or').toggle();

  	modal.find('#lead-text2').text("In other words, based on the currency parameters you've set:");
  	modal.find('#curr4').text("The right to pollute 1 acre of Middlesex Fells is worth " + curr4 + " USD"); 
  	modal.find('#curr5').text("The right to pollute 1 acre of Blue Hills Reservation is worth " + curr5 + " USD");
  	modal.find('#curr6').text("The right to pollute 1 gallon of the Charles River is worth " + curr6 + " USD");

  	modal.find('#extra-text').show();
  	modal.find('#currency-explainers').show();

  }
});

$("#exampleModal").on("hidden.bs.modal", function(e){
    $(this).removeData();
});

