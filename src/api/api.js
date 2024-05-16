import service from '@/utils/request'


export const analysepdf_byurl = (data) => {
    return service({
        url: '/analysepdf_byurl',
        method: 'post',
        data
    })
}

export const summaryParagraph = (data)=>{
    return service({
        url: '/summaryParagraph',
        method: 'post',
        data
    })
}

export const upload_file = (data)=>{
    return service({
        url: '/upload_file',
        method: 'post',
        data
    })
}

