# -*- coding: utf-8 -*-

import os, sys
import time
from datetime import datetime
from functools import wraps

import itchat
from itchat.content import *

from app import db
from app.utils import zh_str, log, get_md5
from app.models import GroupMsg, Group, User, Card, Sharing, Robot
from config import basedir
from config import data_path
from config import head_img_path
from config import qr_img_path
from config import login_img_path


def change_qr_img(qr_img_id):
    qr_img = os.path.join(qr_img_path, str(qr_img_id) + '.png')
    with open(login_img_path, 'rb') as f:
        login_img = f.read()
    with open(qr_img, 'wb') as f:
        f.write(login_img)


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
    获取群名列表
    '''
    room_list = itchat.get_chatrooms()
    room_names = [room.NickName for room in room_list]
    # log(zh_str(room_list), 'room_list.txt')
    return room_names


def download_header_img(itchat, chat_room, user):
    '''
    根据群名，下载所有群成员头像，并返回头像存储的绝对路径
    '''
    path = os.path.join(head_img_path, chat_room['NickName'])
    if not os.path.exists(path):
        os.makedirs(path)
    file_path = os.path.join(path, chat_room['NickName'] + '$:$' + user['NickName'] + '.jpg')
    if os.path.exists(file_path):
        # 如果图片已经存在，则直接返回
        return file_path
    img = itchat.get_head_img(user['UserName'], chat_room['UserName'])
    try:
        with open(file_path, 'wb') as f:
            f.write(img)
        print '成功下载一张头像'
    except Exception as e:
        pass
    finally:
        return file_path


def get_self_name(itchat, room_name):
    """
    根据群名，获取自身的昵称
    """
    chat_room = get_room_from_name(itchat, room_name)
    name = chat_room['Self']['NickName']
    return name


def get_user_list(itchat, room_name):
    """
    根据群名，获取群基本信息
    获取用户列表，如果是新用户，将其插入到user表中
    更新群信息
    """
    chat_room = get_room_from_name(itchat, room_name)
    # log(zh_str(chat_room), 'room.txt')
    man = 0
    female = 0
    no_sex = 0
    robot = chat_room['Self']['NickName']
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
            'GroupName': room_name + '$:$' + user['NickName']
        }
        if user['Sex'] == 0:
            no_sex += 1
        elif user['Sex'] == 1:
            man += 1
        elif user['Sex'] == 2:
            female += 1
        u = User.create(data)
    amount = len(chat_room['MemberList'])

    group_data = {
        'group_name': room_name,
        'amount': amount,
        'man': man,
        'female': female,
        'no_sex': no_sex,
        'robot': robot,
    }
    Group.update(group_data)
    # log(zh_str(u.to_dict()), 'user.txt')
    # log(zh_str(user), 'basic_user.txt')


def create_itchat():
    '''
    构建一个新的itcht实例
    '''
    new_itchat = itchat.new_instance()

    @new_itchat.msg_register([TEXT, MAP], isGroupChat=True)
    def text_reply(msg):
        '''保存文字类信息'''
        log(zh_str(msg))
        group = msg.User.NickName
        data = {
            'id': msg.NewMsgId,
            'type': msg.Type,
            'create_time': float(msg.CreateTime),
            'group': group,
            'group_id': "group_name",
            'user_actual_name': msg.ActualNickName,
            'content': msg.Text,
        }
        group_msg = GroupMsg.create(data)
        log(zh_str(group_msg.to_dict()), 'text.txt')
        print '%s: %s' % (msg.type, msg.text)

    @new_itchat.msg_register([NOTE], isGroupChat=True)
    def text_reply(msg):
        '''保存系统通知类信息'''
        # log(zh_str(msg))
        group = msg.User.NickName
        data = {
            'id': msg.NewMsgId,
            'type': msg.Type,
            'create_time': float(msg.CreateTime),
            'group': group,
            'group_id': "group_name",
            'user_actual_name': msg.ActualNickName,
            'content': msg.Text,
        }
        group_msg = GroupMsg.create(data)
        if u"加入" in msg.Text and u"群聊" in msg.Text:
            # 更新群聊成员信息，一键喊话：
            get_user_list(new_itchat, group)
            log('新人来了', 'xinreng.txt')
            if group in []:
                pass
        # log(zh_str(group_msg.to_dict()), 'text.txt')
        print '%s: %s' % (msg.type, msg.text)

    @new_itchat.msg_register(CARD, isGroupChat=True)
    def text_reply(msg):
        '''保存分名片类信息'''
        log(zh_str(msg))
        group = msg.User.NickName
        data = {
            'id': msg.NewMsgId,
            'type': msg.Type,
            'create_time': float(msg.CreateTime),
            'group': group,
            'group_id': "group_name",
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

    @new_itchat.msg_register(SHARING, isGroupChat=True)
    def text_reply(msg):
        '''保存分享类信息'''
        group = msg.User.NickName
        data = {
            'id': msg.NewMsgId,
            'type': msg.Type,
            'create_time': float(msg.CreateTime),
            'group': group,
            'group_id': "group_name",
            'user_actual_name': msg.ActualNickName,
            'content': msg.Text,
            'sharing_url': msg.Url
        }
        group_msg = GroupMsg.create(data)
        # sharing_msg = Sharing.create(msg)
        # log(zh_str(msg))
        log(zh_str(group_msg.to_dict()), 'text.txt')
        # log(zh_str(sharing_msg.to_dict()), 'sharing.txt')
        print '%s: %s' % (msg.type, msg.text)

    @new_itchat.msg_register([PICTURE, RECORDING, ATTACHMENT, VIDEO], isGroupChat=True)
    def download_files(msg):
        '''下载一些文件'''
        group = msg.User.NickName
        data = {
            'id': msg.NewMsgId,
            'type': msg.Type,
            'create_time': float(msg.CreateTime),
            'group': group,
            'group_id': "group_name",
            'user_actual_name': msg.ActualNickName,
        }
        file_type = msg.type

        file_path = os.path.join(data_path, group, file_type)
        if not os.path.exists(file_path):
            os.makedirs(file_path)
        download_path = os.path.join(file_path, msg.fileName)
        msg.download(download_path)
        data['content'] = os.path.join('data', group, file_type, msg.fileName)
        group_msg = GroupMsg.create(data)

        msg['Text'] = '下载方法'
        # log(zh_str(msg), 'file.txt')
        # log(zh_str(group_msg.to_dict()), 'down_load.txt')
        print '@%s@%s' % (msg.type, msg.fileName)

    return new_itchat


def give_id(user_id):
    def decorate(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(user_id)

        return wrapper

    return decorate


def give_path(pic_dir):
    def decorate(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            kwargs['pic_dir'] = pic_dir
            return func(*args, **kwargs)

        return wrapper

    return decorate


def itchat_run(user_id):
    pic_dir = os.path.join(qr_img_path, user_id + '.png')

    @give_id(user_id)
    def close_robot(robot_id):
        Robot.close(robot_id)

    @give_path(pic_dir=pic_dir)
    def qr_callback(uuid, status, qrcode, pic_dir):
        if status == '0':
            with open(pic_dir, 'wb') as f:
                f.write(qrcode)
        elif status == '408':
            sys.exit()

    itchat = create_itchat()
    if not os.path.exists(qr_img_path):
        os.makedirs(qr_img_path)

    itchat.auto_login(statusStorageDir=user_id + '.pkl',
                      picDir=pic_dir,
                      exitCallback=close_robot,
                      qrCallback=qr_callback)

    room_names = get_group_list(itchat)
    if len(room_names) > 0:
        robot_name = get_self_name(itchat, room_names[0])
        robot_data = {
            'robot_id': user_id,
            'name': robot_name,
            'status': 'open'
        }
        Robot.open(robot_data)
    # 开启机器人

    for room_name in room_names:
        get_user_list(itchat, room_name)
    # 下载群成员信息

    itchat.run(debug=True, exitCallback=close_robot)
