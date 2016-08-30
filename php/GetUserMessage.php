<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-7
 * Time: 下午11:14
 */

include_once "ConnectDatabase.php";


session_start();
if(!isset($_SESSION["userid"])){
    echo 0;
}else{
    connectToDB();
    $result=mysql_query("select id,NAME,LEVEL,levelstep from users where id='".$_SESSION["userid"]."'");
    if(mysql_num_rows($result)<=0){
        echo 0;
    }else{
        $data=mysql_fetch_assoc($result);
        echo json_encode($data);
    }
}


