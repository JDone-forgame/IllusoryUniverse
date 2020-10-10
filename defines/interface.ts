/**
 * auto generate by tableconvert
 */

/**
 * SeEnumItemeItemName generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export enum SeEnumItemeItemName{ 
      ShuiDi=1,
      JinZhuan=2,
      YangFen=3,
      BaoHuZhao=4,
}


/**
 * SeEnumItemeItemType generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export enum SeEnumItemeItemType{ 
      YouXiDaoJu=1,
      WaiBuDaoJu=2,
}


/**
 * SeEnumItemeShowType generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export enum SeEnumItemeShowType{ 
      ChangZhuXianShi=1,
      BuChangZhuXianShi=0,
}


/**
 * SeEnumPaneleType generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export enum SeEnumPaneleType{ 
      HaoYouBaiFang=1,
      HaoYouJiaoShui=2,
      HaoYouTouShui=3,
      JiaoShui=4,
      TouShui=5,
      FangHuTouShui=6,
}


/**
 * SeEnumShareePos generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export enum SeEnumShareePos{ 
      WeiXinYaoQingHaoYouFenXiang=1,
      TiLiBuZuJieMian=2,
      RenWuLieBiaoYaoQingHaoYou=3,
      JiXingZhuLiRenWu=4,
}


/**
 * SeEnumTaskeTaskType generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export enum SeEnumTaskeTaskType{ 
      MianFeiLingShui=1,
      JiaoShuiRenWu=2,
      DingDianLiBao=3,
      YaoQingHaoYou=4,
      HaoYouZhuLi=5,
}


/**
 * SeResAddWater generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResAddWater{ 
      sID:string;
      iAddWater:number;
      iAddWaterMax:number;
}


/**
 * SeResExperience generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResExperience{ 
      sID:string;
      sName:string;
      iWaterNum:number;
      iExperience:number;
      aiAddEx:Array<number>;
      aiAddWeight:Array<number>;
      sPicture:string;
      sPictureShadow:string;
      sDescribe:string;
      asGift:Array<string>;
      iStep:number;
      iProtScale:number;
}


/**
 * SeResGlobal generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResGlobal{ 
      sID:string;
      sGlobalType:string;
      sGlobalData:string;
}


/**
 * SeResGuide generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResGuide{ 
      sID:string;
      sTitle:string;
      sIcon:string;
      sName:string;
      sNextId:string;
      iCancel:number;
      iWait:number;
      sOffPos:string;
      sFingerOff:string;
      iCD:number;
      sUnLock:string;
}


/**
 * SeResItem generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResItem{ 
      sID:string;
      sName:string;
      eItemName:SeEnumItemeItemName;
      eItemType:SeEnumItemeItemType;
      sDescribe:string;
      sRes:string;
      iTcItemNum:number;
      eShowType:SeEnumItemeShowType;
      sJumpType:string;
}


/**
 * SeResNutrientExp generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResNutrientExp{ 
      sID:string;
      iMinNutrient:number;
      iMaxNutrient:number;
      aiAddEx:Array<number>;
      aiAddWeight:Array<number>;
      iReduceChance:number;
}


/**
 * SeResPanel generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResPanel{ 
      sID:string;
      eType:SeEnumPaneleType;
      sGiftTwo:string;
}


/**
 * SeResShare generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResShare{ 
      sID:string;
      ePos:SeEnumShareePos;
      sUrl:string;
      sWriting:string;
}


/**
 * SeResSign generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResSign{ 
      sID:string;
      asGiftOne:Array<string>;
      asGiftTwo:Array<string>;
}


/**
 * SeResTask generate in[Fri Sep 18 2020 09:21:14 GMT+0800 (GMT+08:00)] 
 */
export interface SeResTask{ 
      sID:string;
      sTaskTitle:string;
      eTaskType:SeEnumTaskeTaskType;
      sCondition:string;
      asTaskitems:Array<string>;
      sDescribe:string;
      sUnlock:string;
      iTaskOrder:number;
      sIcon:string;
      sJumpType:string;
}


