<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-7
 * Time: 下午7:17
 */

include_once "ConnectDatabase.php";


connectToDB();
$pageNum=intval($_GET["pagenum"]);
$result=mysql_query("select NAME,LEVEL,levelstep from users ORDER BY LEVEL DESC,levelstep ASC LIMIT ".(($pageNum-1)*10).",10");
$rankdata=array();
for($i=0;$i<mysql_num_rows($result);$i++){
    $rankdata[$i]=mysql_fetch_assoc($result);
}
echo json_encode($rankdata);
