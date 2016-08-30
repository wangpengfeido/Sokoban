<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-8
 * Time: 下午11:37
 */

include "ConnectDatabase.php";

session_start();
if(!isset($_SESSION["userid"])){
    echo "0";
    exit();
}
$userid=intval($_SESSION["userid"]);
$level=intval($_POST["level"]);
$step=intval($_POST["step"]);
connectToDB();
$result=mysql_query("update users set LEVEL=".$level.",levelstep=".$step." where id=".$userid);
echo mysql_affected_rows();
echo mysql_error();
