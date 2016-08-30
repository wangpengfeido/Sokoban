<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-7
 * Time: 下午7:25
 */

include_once "ConnectDatabase.php";

connectToDB();
$result=mysql_query("select count(*) from users");
$row=mysql_fetch_row($result);
$userNum=intval($row[0]);
$pageCount=intval(($userNum-1)/10)+1;
echo $pageCount;