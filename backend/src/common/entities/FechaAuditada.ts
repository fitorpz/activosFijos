import {
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export abstract class FechaAuditada {
    @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en', type: 'timestamp' })
    modificadoEn: Date;

    @BeforeInsert()
    setFechaCreacion() {
        this.creadoEn = dayjs().tz('America/La_Paz').toDate();
    }

    @BeforeUpdate()
    setFechaActualizacion() {
        this.modificadoEn = dayjs().tz('America/La_Paz').toDate();
    }
}
