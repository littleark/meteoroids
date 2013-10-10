<?php
$url = "bolid.es";
$finfo = json_decode(file_get_contents('http://api.ak.facebook.com/restserver.php?v=1.0&method=links.getStats&urls=www.'.$url.'&format=json'));
$tinfo = json_decode(file_get_contents('http://urls.api.twitter.com/1/urls/count.json?url='.$url));
$t2info = json_decode(file_get_contents('http://urls.api.twitter.com/1/urls/count.json?url=www.'.$url));
//$dinfo = json_decode(file_get_contents('http://feeds.delicious.com/v2/json/urlinfo/data?url=www.'.$url));
//$pinfo = json_decode(preg_replace('/^receiveCount\((.*)\)$/', "\\1",file_get_contents('http://api.pinterest.com/v1/urls/count.json?url=http://www.'.$url.+"/")));
$pinfo = json_decode(preg_replace('/^receiveCount\((.*)\)$/', "\\1",file_get_contents('http://api.pinterest.com/v1/urls/count.json?url=http://www.bolid.es/')));
$gplus = gplus_shares("http://www.bolid.es");
 

//var_export($pinfo);
 
//http://papermashup.com/google-plus-php-function/
function gplus_shares($url){
    // G+ DATA

    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL, "https://clients6.google.com/rpc?key=AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '[{"method":"pos.plusones.get","id":"p",
"params":{"nolog":true,"id":"' . $url . '","source":"widget","userId":"@viewer","groupId":"@self"},
"jsonrpc":"2.0","key":"p","apiVersion":"v1"}]');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
       
    $result = curl_exec ($ch);
    //var_export($result);
    curl_close ($ch);
    return json_decode($result, true);

}
 
$output = array(
    'fb'=> isset($finfo[0]) ? $finfo[0]->total_count : NULL,
    't'=> isset($tinfo->count) ? $tinfo->count : NULL,
    't2'=> isset($t2info->count) ? $t2info->count : NULL,
    //'delicious'=> isset($dinfo[0]) ? $dinfo[0]->total_posts : NULL,
    'p'=> isset($pinfo->count) ? $pinfo->count : NULL,
    'gp'=> isset($gplus[0]['result']) ? $gplus[0]['result']['metadata']['globalCounts']['count'] : NULL
 
);
 
//header('Content-Type: text/javascript');
 
echo json_encode($output);
?>