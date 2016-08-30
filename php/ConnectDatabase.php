<?php
/**
 * Created by PhpStorm.
 * User: wangpengfei
 * Date: 16-7-7
 * Time: 下午6:15
 */

function createConnect(){
    return mysql_connect("localhost",'root','');
}

function connectToDB(){
    $severid=createConnect();
    mysql_select_db("sokoban",$severid);
}