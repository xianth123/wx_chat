# -*- coding: utf-8 -*-

from datetime import datetime
import os

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.ext.hybrid import hybrid_method


from app import db
from app.utils import log
from user import User

__all__ = ['GroupMsg']


class GroupMsg(db.Model):
    '''
    id:                 每条信息的唯一标识
    type:               消息的类型
    create_time:        消息的制造时间
    user_group_name:    格式为 群名 + $:$ + 微信名   用户的唯一标识
    user_display_name:  用户的群昵称
    user_nick_name:     用户的微信名。
    room_id:            房间id，作为房间的唯一标示，自己生成的,保留该数据项
    room_name:          房间名称
    content:            文本内容或者文件下载地址
    '''
    __tablename__ = 'group_msg'

    id = db.Column(db.String(256), primary_key=True)
    type = db.Column(db.String(32), nullable=False, index=True)
    group_id = db.Column(db.String(32), nullable=False)
    group = db.Column(db.String(32), nullable=False, index=True)
    create_time = db.Column(db.Float, nullable=False, index=True)
    time = db.Column(db.DateTime, nullable=True, index=True)

    user_actual_name = db.Column(db.String(128), nullable=False, index=True)
    user_nick_name = db.Column(db.String(128), nullable=False, index=True)
    user_group_name = db.Column(db.String(128), nullable=False, index=True)
    user_display_name = db.Column(db.String(128), nullable=True, index=True)

    content = db.Column(db.String(256), nullable=True, index=True)
    sharing_url = db.Column(db.String(256), nullable=True)

    def __init__(self, data):
        self.id = data['id']
        self.type = data['type']
        self.group_id = data['group_id']
        self.group = data['group']
        self.create_time = data['create_time']

        self.user_actual_name = data['user_actual_name']
        self.user_nick_name = self.user_wx_name[0]
        self.user_group_name = self.group+'$:$'+self.user_nick_name
        self.user_display_name =self.user_wx_name[1]

        self.content = data['content']
        self.sharing_url = data.get('sharing_url', '')

    @classmethod
    def create(cls, data):
        msg = cls.query.filter_by(id=data['id']).first()
        if msg:
            return msg
        msg = cls(data)
        db.session.add(msg)
        db.session.commit()
        return msg

    @property
    def user_wx_name(self):
        '''
        根据group_name查找，返回用户的 微信昵称, 群昵称
        若找不到，直接返回从群消息中获得的actual_name
        '''
        u = User.find_one(self.group+'$:$'+self.user_actual_name)
        if u:
            return u.nick_name, u.display_name
        return self.user_actual_name, None

    @classmethod
    def update_time(cls):
        msgs = cls.query.all()
        for msg in msgs:
            msg.time = datetime.fromtimestamp(msg.create_time)
            db.session.add(msg)
        db.session.commit()


    # @property
    # def user_name(self):
    #     u = User.query.filter_by(remark_name=self.user_remark_name).first()
    #     return u.remark_name or self.user_actual_name

    # @hybrid_property
    # def time(self):
    #     return datetime.fromtimestamp(self.create_time)

    @hybrid_method
    def in_time(self, time1, time2):
        return self.time < time1 and time2 <= self.time

    def to_dict(self):
        data = {
            'id': self.id,
            'type': self.type,
            'time': str(self.time),
            'group': self.group,
            'group_id': self.group_id,
            'create_time': self.create_time,
            'user_actual_name': self.user_actual_name,
            'user_nick_name': self.user_nick_name,
            'user_group_name': self.user_group_name,
            'user_display_name': self.user_display_name,

            'content': self.content,
            'sharing_url': self.sharing_url,
        }
        return data

    @property
    def file_path(self):
        '''
        返回各类下载文件的url
        '''
        return os.path.join('data', self.group, self.type, self.content.split('/')[-1])

    def picture(self):
        if self.type == 'Picture':
            return ''
        return ''