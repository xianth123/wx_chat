# -*- coding: utf-8 -*-

from app import db

__all__ = ['Card']

class Card(db.Model):
    __tablename__ = 'cards'

    id = db.Column(db.String(128), primary_key=True)
    nick_name = db.Column(db.String(32), nullable=False)
    city = db.Column(db.String(32), nullable=True)
    province = db.Column(db.String(32), nullable=True)
    sex = db.Column(db.Integer, nullable=True)
    signature = db.Column(db.String(256), nullable=True)
    scene = db.Column(db.String(32), nullable=True)

    def __init__(self, data):
        self.id = data['id']
        self.nick_name = data['NickName']
        self.city = data['City']
        self.province = data['Province']
        self.sex = data['Sex']
        self.signature = data['Signature']
        self.scene = data['Scene']

    @classmethod
    def create(cls, data):
        card = cls.query.filter_by(id=data['id']).first()
        if card:
            return card
        card = cls(data)
        db.session.add(card)
        db.session.commit()
        return card

    def to_dict(self):
        data = {
            'id': self.id,
            'nick_name': self.nick_name,
            'city': self.city,
            'province': self.province,
            'sex': self.sex,
            'signature': self.signature,
            'scene': self.scene,
        }
        return data