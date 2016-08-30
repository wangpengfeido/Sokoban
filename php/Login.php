<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-7
 * Time: 下午6:15
 */
include_once 'ConnectDatabase.php';

//TODO
connectToDB();
$name=$_POST["username"];
$password=$_POST["password"];
$result=mysql_query("select id,NAME,LEVEL,levelstep from users where NAME ='".$name."' and PASSWORD='".$password."'");
$num=mysql_num_rows($result);
if($num==0){
    echo 0;
}else{
    $data=mysql_fetch_assoc($result);
    session_start();
    ini_set('session.gc_maxlifetime', 50000);
    $_SESSION["userid"]=$data["id"];
    $_SESSION["username"]=$data["NAME"];
    echo json_encode($data);
}
