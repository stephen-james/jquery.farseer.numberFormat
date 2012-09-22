/*  
    Farseer library 
    Namespace : Farseer.NumberFormat 
*/

var Farseer = Farseer || {};

Farseer.NumberFormat = Farseer.NumberFormat || {
    
    _matchNumericExp : 
        // matches a numeric expression with selection groups for sign (pre or post prefix), prefix and suffix
        /(-)?\s?([\$£€a-zA-Z]+)?\s?(-)?(\d+[\d\.,]+)\s?([\$£€%a-zA-Z\\\/]+)?/, 
    
    _commasOrPeriodsExp :
        // matches commas or periods
        /([,\.])/g,
        
    _matchCommaGroupsExp : /(\d+)(\d{3})/,
    
    _extractNumberParts : function(valueToParse)
    {
        var returnValue = {
            prefix : "",
            suffix : "",
            rawValue : "",
            value : 0,
            sign : ""
        };
        
        var matchedNumberParts = String(valueToParse).match(this._matchNumericExp);
        
        if (matchedNumberParts)
        {    
            if (matchedNumberParts[1] == "-" || matchedNumberParts[3] == "-")
            {
                returnValue.sign = "negative";
            }        
            else
            {
                returnValue.sign = "positive";
            }
             
            returnValue.prefix = matchedNumberParts[2];
            returnValue.suffix = matchedNumberParts[5];        
            returnValue.rawValue = matchedNumberParts[4];
        }
        
        return returnValue;
    },
    
    _neutraliseLocale : function(numberToNeutralise)
    {
        // check for existence of commas and periods, we'll need to figure out which way around this is
        // ie. could be 123,123,123.00 or 123.123.123,00 depending on locale, or simply may have no decimals and just the thousand seperator

        var 
            numericStringToNeutralise = String(numberToNeutralise),
            containsComma = numericStringToNeutralise.indexOf(",") != -1,
            containsPeriod = numericStringToNeutralise.indexOf(".") != -1;
            
        if (containsComma && containsPeriod)
        {
            var decimalDelimiter = "unknown";
            var currentChar = "";
            // check what decimal delimiter is, check from the right for first match of either comma or period
            for (var charIndex = numberToNeutralise.length - 1; charIndex > 0; charIndex--)
            {
                currentChar = numberToNeutralise.charAt(charIndex);
                if (currentChar == "." || currentChar == ",")
                {
                    decimalDelimiter = currentChar;
                    break;
                }
            }
            if (decimalDelimiter != "unknown")
            {
                var parts = numberToNeutralise.split(decimalDelimiter);
                if (parts.length > 2)
                {
                    // something has gone wrong
                    return undefined;                    
                }
                
                return +(String(parts[0]).replace(this._commasOrPeriodsExp, '') + "." + parts[1]);
            }
            else
            {
                // something has gone wrong
                return undefined;
            }
        }
        else
        {
            var thousandDelimiterMatch = numericStringToNeutralise.match(this._commasOrPeriodsExp);
            if (thousandDelimiterMatch && thousandDelimiterMatch.length > 1)
            {
                // the number contains thousand seperator only, remove commas and periods
                return numericStringToNeutralise.replace(this._commasOrPeriodsExp, '');                
            }
            else
            {
                // the number contains a decimal seperator only, replace with standard period
                return numericStringToNeutralise.replace(this._commasOrPeriodsExp, '.');
            }
        }
    },
    
    tryParseNumber :  function(valueToParse) {
        
        var parseStatus = false,
            parsedNumberParts = this._extractNumberParts(valueToParse);
        
        if (parsedNumberParts.rawValue !== undefined)
        {
            // we've extracted a numeric string, but we need to neutralise the locale and formatting and sign it correctly
            // before we can consider it parsed.
            var neutralisedNumber = this._neutraliseLocale(parsedNumberParts.rawValue);
            if (neutralisedNumber !== undefined)
            {
                parsedNumberParts.value = neutralisedNumber * ((parsedNumberParts.sign == "negative") ? -1 : 1);
                parseStatus = true;
            }
        }
        
        return { parsed : parseStatus, parsedNumber : parsedNumberParts };
    },

    formatNumber :  function(number, commas, decimalPlaces){
            
            var returnValue =  (+number).toFixed(decimalPlaces);
            if (commas){
                returnValue = this.addCommas(returnValue); 
            }
            return returnValue;
        },
    
    // handy function to addCommas per leading thousands taken and gently adapted from http://www.mredkj.com/javascript/numberFormat.html 
    addCommas : function(numberToFormat){
        numberToFormat += '';
        var x = numberToFormat.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
};

/* end Farseer library code*/


/* Farseer jQuery NumberFormat Plugin */

(function($) {
    $.fn.numberFormat = function(options) {
        var $target = this;
        
        $target.each(function() {
            var formatString = $(this).data("number-format");
            var parseResult = Farseer.NumberFormat.tryParseNumber($(this).val());
            
            if (formatString && parseResult.parsed)
            {
                alert(Farseer.NumberFormat.formatNumber(parseResult.parsedNumber.value, 3, 2));
            }
        });
        
        return $target;
    };
})(jQuery);
