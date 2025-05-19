import * as jwt from 'jsonwebtoken';

export function patchBodyAndHeaders({
    body,
    headers,
    jwtSecret,
    requireUserId = false,
    requireStaffId = false,
}: {
    body: any,
    headers: any,
    jwtSecret: string,
    requireUserId?: boolean,
    requireStaffId?: boolean,
}) {
    let patchedBody = { ...body };
    let patchedHeaders = {
        'content-type': 'application/json',
        'accept': 'application/json, text/plain, */*',
    };

    const authHeader = headers['authorization'] || headers['Authorization'];
    if (requireUserId || requireStaffId) {
        if (!authHeader) throw new Error('No Authorization header');
        const token = authHeader.replace('Bearer ', '');
        let payload: any;
        try {
            payload = jwt.verify(token, jwtSecret || 'changeme');
        } catch {
            throw new Error('Invalid JWT');
        }
        if (requireStaffId && !patchedBody.createdBy && payload.staff_id) {
            patchedBody.createdBy = payload.staff_id;
        }
        if (requireUserId && !patchedBody.userId && payload.user_id) {
            patchedBody.userId = payload.user_id;
        }
        patchedHeaders['authorization'] = authHeader;
    } else if (authHeader) {
        // 인증이 필수는 아니지만, 헤더가 있으면 그대로 전달
        patchedHeaders['authorization'] = authHeader;
    }

    return { patchedBody, patchedHeaders };
} 