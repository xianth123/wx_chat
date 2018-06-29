# -*- coding: utf-8 -*-

import os
import time

import itchat
from itchat.content import *

from app import db
from app.utils import zh_str, log, get_md5
from app.models import GroupMsg, Group, User, Card, Sharing
from config import basedir


@itchat.msg_register([TEXT, MAP, NOTE], isGroupChat=True)
def text_reply(msg):
    '''保存文字类信息'''
    log(zh_str(msg))


    group_dict = Group.name_id_dict()

    group = msg.User.NickName
    group_id = group_dict.get(group, 'group_name')
    data = {
        'id': msg.NewMsgId,
        'type': msg.Type,
        'create_time': float(msg.CreateTime),
        'group': group,
        'group_id': group_id,
        'user_actual_name': msg.ActualNickName,
        'content': msg.Text,
    }
    group_msg = GroupMsg.create(data)
    log(zh_str(group_msg.to_dict()), 'text.txt')
    print '%s: %s' % (msg.type, msg.text)


@itchat.msg_register(CARD, isGroupChat=True)
def text_reply(msg):
    '''保存分名片类信息'''
    log(zh_str(msg))
    group_dict = Group.name_id_dict()

    group = msg.User.NickName
    group_id = group_dict.get(group, 'group_name')
    data = {
        'id': msg.NewMsgId,
        'type': msg.Type,
        'create_time': float(msg.CreateTime),
        'group': group,
        'group_id': group_id,
        'user_actual_name': msg.ActualNickName,
        'content': msg.Text['NickName'],
    }

    card_data = msg.Text
    card_data['id'] = msg.NewMsgId
    card = Card.create(card_data)
    group_msg = GroupMsg.create(data)
    log(zh_str(card.to_dict()), 'card.txt')
    log(zh_str(group_msg.to_dict()), 'text.txt')
    print '%s: %s' % (msg.type, msg.text)


@itchat.msg_register(SHARING, isGroupChat=True)
def text_reply(msg):
    '''保存分享类信息'''
    group_dict = Group.name_id_dict()
    group = msg.User.NickName
    group_id = group_dict.get(group, 'group_name')
    data = {
        'id': msg.NewMsgId,
        'type': msg.Type,
        'create_time': float(msg.CreateTime),
        'group': group,
        'group_id': group_id,
        'user_actual_name': msg.ActualNickName,
        'content': msg.Text,
    }
    group_msg = GroupMsg.create(data)
    sharing_msg = Sharing.create(msg)
    # log(zh_str(msg))
    log(zh_str(group_msg.to_dict()), 'text.txt')
    log(zh_str(sharing_msg.to_dict()), 'sharing.txt')
    print '%s: %s' % (msg.type, msg.text)


@itchat.msg_register([PICTURE, RECORDING, ATTACHMENT, VIDEO], isGroupChat=True)
def download_files(msg):
    '''下载一些文件'''
    group_dict = Group.name_id_dict()

    group = msg.User.NickName
    group_id = group_dict.get(group, 'group_name')
    data = {
        'id': msg.NewMsgId,
        'type': msg.Type,
        'create_time': float(msg.CreateTime),
        'group': group,
        'group_id': group_id,
        'user_actual_name': msg.ActualNickName,
    }
    file_type = msg.type
    file_path = os.path.join(basedir, 'data', group, file_type)
    if not os.path.exists(file_path):
        os.makedirs(file_path)
    fileName = os.path.join(file_path, msg.fileName)
    msg.download(fileName)
    data['content'] = fileName
    group_msg = GroupMsg.create(data)

    msg['Text'] = '下载方法'
    log(zh_str(msg), 'file.txt')
    log(zh_str(group_msg.to_dict()), 'down_load.txt')
    print '@%s@%s' % (msg.type, msg.fileName)


def get_room_from_name(itchat, name):
    '''
    根据房间名字，返回房间对象
    '''
    itchat.dump_login_status()
    rooms = itchat.search_chatrooms(name=name)
    if rooms is None:
        return None
    return itchat.update_chatroom(rooms[0]['UserName'], detailedMember=True)


def get_group_list(itchat):
    '''
    获取群列表，并将其插入到 group 数据库中
    :param itchat:
    :return:
    '''
    room_list = itchat.get_chatrooms()
    room_names = [room.NickName for room in room_list]
    Group.create_group_from_name_list(room_names)
    return room_names


def remark_name_generate(user):
    '''
    :param user:
    :return:
    '''
    remark_name = user['NickName'] + '$:$' + get_md5(user['HeadImgUrl'])
    return remark_name


def download_header_img(itchat,chat_room, user):
    '''
    下载头像，并返回头像存储的绝对路径
    '''
    path = os.path.join(basedir, 'header_image', chat_room['NickName'])
    if not os.path.exists(path):
        os.makedirs(path)
    file_path = os.path.join(path, chat_room['NickName']+'$:$'+user['NickName']+'.jpg')
    if os.path.exists(file_path):
        #如果图片已经存在，则直接返回
        return file_path
    img = itchat.get_head_img(user['UserName'], chat_room['UserName'])
    # time.sleep(0.5)
    try:
        with open(file_path, 'wb') as f:
            f.write(img)
        print '成功下载一张头像'
    except Exception as e:
        pass
    finally:
        return file_path


def get_user_list(itchat, room_name):
    '''
    获取用户列表，如果是新用户，将其插入到user表中
    '''
    chat_room = get_room_from_name(itchat, room_name)
    log(zh_str(chat_room), 'room.txt')
    for user in chat_room['MemberList']:

        file_path = download_header_img(itchat, chat_room, user)
        data = {
            'Group': room_name,
            'NickName': user['NickName'],
            'DisplayName': user['DisplayName'],
            'RemarkName': user['RemarkName'],
            'Province': user['Province'],
            'City': user['City'],
            'Signature': user['Signature'],
            'Sex': user['Sex'],
            'HeadImgUrl': file_path,
            'GroupName': room_name+'$:$'+user['NickName']
        }
        u = User.create(data)
        log(zh_str(u.to_dict()), 'user.txt')
        log(zh_str(user), 'basic_user.txt')


def itchat_run():
    itchat.auto_login()
    room_names = get_group_list(itchat)
    for room_name in room_names:
        get_user_list(itchat, room_name)
    itchat.run()
