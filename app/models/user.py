# -*- coding: utf-8 -*-

import datetime
import os

from app import db
from app.utils import generator_string_id

__all__ = ['User']


def id_generator():
    return generator_string_id(16, 2)


class User(db.Model):
    '''
    id:                 自动生成的序号
    group               用户所在群
    group_name          唯一标识  格式为 群名$:$微信名
    nick_name           用户微信名
    display_name        用户群昵称
    remark_name         备注名称
    province            用户省份
    signature           用户个性签名
    sex                 性别 男：1 女：2 未知：3
    header_image        用户头像的链接（暂时存储在本地）
    group_name          唯一标识  格式为 群名$:$微信名
    group_name2         可以为空  格式为 群名片$:$微信名

    '''

    __tablename__ = 'users'

    id = db.Column(db.String(256), primary_key=True,
                   default=id_generator)
    group = db.Column(db.String(128), nullable=False, index=True)

    nick_name = db.Column(db.String(128), nullable=False, index=True)
    display_name = db.Column(db.String(128), nullable=True, index=True)
    remark_name = db.Column(db.String(128), nullable=True, index=True)

    province = db.Column(db.String(32), nullable=True, index=True)
    city = db.Column(db.String(32), nullable=True)
    signature = db.Column(db.String(256), nullable=True)
    sex = db.Column(db.Integer, nullable=False)
    header_image = db.Column(db.String(256), nullable=False)

    group_name = db.Column(db.String(128), nullable=False, unique=True, index=True)
    group_name2 = db.Column(db.String(128), nullable=True, index=True)

    def __init__(self, data):
        # self.id = data['RemarkName']
        self.group = data['Group']
        self.nick_name = data['NickName']
        self.display_name = data['DisplayName']
        self.remark_name = data['RemarkName']
        self.province = data['Province']
        self.city = data['City']
        self.signature = data['Signature']
        self.sex = data['Sex']
        self.header_image = data['HeadImgUrl']

        self.group_name = self.group+'$:$'+self.nick_name
        if self.display_name:
            self.group_name2 = self.group+'$:$'+self.display_name

    @classmethod
    def create(cls, data):
        user = cls.query.filter_by(group_name=data['GroupName']).first()
        if user:
            return user
        user = cls(data)
        db.session.add(user)
        db.session.commit()
        return user

    @classmethod
    def find_one(cls, name):
        u = cls.query.filter_by(group_name2=name).first()
        if u:
            return u
        return cls.query.filter_by(group_name=name).first()

    @property
    def head_img(self):
        return os.path.join('head_img', self.group, self.group+'$:$'+self.nick_name+'.jpg')

    def to_dict(self):
        data = {
            'id': self.id,
            'group': self.group,
            'nick_name': self.nick_name,
            'display_name': self.display_name,
            'remark_name': self.remark_name,
            'province': self.province,
            'city': self.city,
            'signature': self.signature,
            'sex': self.sex,
            'head_img_url': self.header_image,
            'group_name': self.group_name,
            'group_name2': self.group_name2,
        }
        return data

