// domain/Agendamento.java
package com.exemplo.barbearia.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"barbeiro_id", "inicio"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Agendamento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(optional = false) @JoinColumn(name = "barbeiro_id")
    private Barbeiro barbeiro;

    @NotNull @Future
    private LocalDateTime inicio;

    @NotNull
    private LocalDateTime fim;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.PENDENTE;

    public enum Status {
        PENDENTE, CONFIRMADO, CANCELADO
    }
}
