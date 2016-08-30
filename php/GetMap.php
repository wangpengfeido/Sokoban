<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-7
 * Time: 下午7:01
 */

include_once "ConnectDatabase.php";

connectToDB();
$mapNum=intval($_GET['mapnum']);
$result=mysql_query("select mapstr from maps where lavel='".$mapNum."'");
$row=mysql_fetch_row($result);
echo $row[0];
