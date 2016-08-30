<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-8
 * Time: 上午12:39
 */

include_once "ConnectDatabase.php";


$username=$_POST["username"];
$password=$_POST["password"];
connectToDB();
mysql_query("insert into users(NAME,PASSWORD) VALUES('".$username."','".$password."')");
$id=mysql_insert_id();
if($id==0){
    echo 0;
}else{
    session_start();
    ini_set('session.gc_maxlifetime', 50000);
    $_SESSION["userid"]=$id;
    $_SESSION["username"]=$username;
    echo $id;
}


