var height = 0;
var width = 0;

function appStart(){
    
    $('#s').click(function(){
        
        height = $('#h').val();
        width = $('#w').val();
        
        $('label').hide();
        
        $('#h').hide();
        $('#w').hide();
        $(this).hide();
        
        $('#display').show();
        
        var obj = $('table');
        var value1 = '';
        var value2 = '';
        
        for(var i = 0; i < height; i ++){
            obj.append('<tr>');
            
            for(var j = 0; j < width; j ++){
                
                if((j == 0) || (j == width - 1) || (i == 0) || (i == height - 1)){
                    value1 = 'selected';
                    value2 = '';
                } else{
                    value1 = '';
                    value2 = 'selected';
                }
                
                obj.append('<td style="margin: 0px; padding: 0px"><select style="width: 32px; height: 20px; padding: 0px; margin: 0px"><option ' + value1 + ' value="x">x</option><option value="!">!</option><option ' + value2 + ' value=" "> </option><option value="o">o</option><option value="g">g</option></select></td>');
            }
            obj.append('</tr>');
        }       
        
    });
    
    $('#display').click(function(){
        
        var result = "";
        var current = 0;
        
        $('td select').each(function(){
            result += $(this).val();
            current ++;
            if (current % width == 0){
                result += '\n'
            }
        })
        
        $('#response').text(result.slice(0,-1));
        
        $(this).hide();
        $('table').hide();
        
        $('.firstSection').remove();
    });
    
}